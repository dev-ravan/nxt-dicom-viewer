"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  RenderingEngine,
  Enums,
  type Types,
  metaData,
} from "@cornerstonejs/core";
import { init as csRenderInit } from "@cornerstonejs/core";
import {
  init as dicomLoaderInit,
  wadouri,
} from "@cornerstonejs/dicom-image-loader";

import {
  init as toolsInit,
  ToolGroupManager,
  addTool,
  Enums as ToolEnums,
  PanTool, ProbeTool, ZoomTool, LengthTool, StackScrollTool
} from "@cornerstonejs/tools";


function Viewer() {
  const elementRef = useRef<HTMLDivElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const running = useRef(false);
  const imageIdsRef = useRef<string[]>([]);

  function usMetadataProvider(type: string, imageId: string) {
    if (type === "patientInfo" || type === "studyInfo") {
      if (imageId === "us://1") {
        if (type === "patientInfo") {
          return {
            patientName: "John Doe",
            patientID: "123456",
            patientSex: "M",
            patientBirthDate: "19800101",
          };
        } else if (type === "studyInfo") {
          return {
            studyInstanceUID: "1.2.3.4.5.6.7.8.9",
            studyDate: "20230515",
            studyTime: "143000",
            studyDescription: "Abdominal Ultrasound",
            referringPhysicianName: "Dr. Jane Smith",
            accessionNumber: "A123456",
          };
        }
      }
    }
  }

  useEffect(() => {
    const setup = async () => {
      if (running.current || files.length === 0 || !elementRef.current) return;
      running.current = true;

      await csRenderInit();
      await dicomLoaderInit({
        maxWebWorkers: 1,
      });
      await toolsInit();

      metaData.addProvider(usMetadataProvider);

      // Add the scroll tool
      addTool(StackScrollTool);
      addTool(PanTool);
      addTool(ZoomTool);
      addTool(LengthTool);
      addTool(ProbeTool);

      const toolGroupId = "stackToolGroup";
      const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);

      // Register the scroll tool
      toolGroup?.addTool(StackScrollTool.toolName);
      toolGroup?.addTool(PanTool.toolName);
      toolGroup?.addTool(ZoomTool.toolName);
      toolGroup?.addTool(LengthTool.toolName);
      toolGroup?.addTool(ProbeTool.toolName);

      // Set the tool as active with proper mouse wheel binding
      toolGroup?.setToolActive(StackScrollTool.toolName, {
        bindings: [{ mouseButton: ToolEnums.MouseBindings.Wheel }],
      });
      toolGroup?.setToolActive(LengthTool.toolName, {
        bindings: [{ mouseButton: ToolEnums.MouseBindings.Secondary }],
      });
      toolGroup?.setToolActive(PanTool.toolName, {
        bindings: [{ mouseButton: ToolEnums.MouseBindings.Auxiliary }],
      });
      toolGroup?.setToolActive(ZoomTool.toolName, {
        bindings: [{ mouseButton: ToolEnums.MouseBindings.Primary }],
      });

      // Generate imageIds like 'wadouri:example.dcm'
      const imageIds = await loadFilesAndGenerateImageIds(files);

      // Store imageIds in the ref for access from event listeners
      imageIdsRef.current = imageIds;

      const renderingEngineId = "myRenderingEngine";
      const renderingEngine = new RenderingEngine(renderingEngineId);

      const viewportId = "US";
      const viewportInput = {
        viewportId,
        type: Enums.ViewportType.STACK,
        element: elementRef.current,
        defaultOptions: {
          orientation: Enums.OrientationAxis.AXIAL,
        },
      };

      renderingEngine.enableElement(viewportInput);

      const viewport = renderingEngine.getViewport(
        viewportId
      ) as Types.IStackViewport;

      // Link tool group to the viewport
      toolGroup?.addViewport(viewportId, renderingEngineId);

      // Log before setting stack
      console.log("About to set image stack", imageIds);

      // Set image stack and render
      await viewport.setStack(imageIds);
      viewport.render();
    };

    setup();
  }, [files]);

  // Function to load files and generate imageIds
  const loadFilesAndGenerateImageIds = async (
    files: File[]
  ): Promise<string[]> => {
    const imageIds: string[] = [];

    for (const file of files) {
      try {
        // Create an object URL for the file
        const objectUrl = URL.createObjectURL(file);

        // Register the file with wadouri fileManager
        wadouri.fileManager.add(file);

        // Create a proper imageId using the object URL
        const imageId = `wadouri:${objectUrl}`;
        imageIds.push(imageId);

        console.log(`Added imageId: ${imageId}`);
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
      }
    }

    return imageIds;
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <input
          className="border border-amber-100 p-3"
          type="file"
          multiple
          accept=".dcm"
          onChange={(e) => {
            const selectedFiles = Array.from(e.target.files || []);
            setFiles(selectedFiles);
            running.current = false; // Reset running flag to allow reinitialization
          }}
        />

        <div
          ref={elementRef}
          className="h-[600px] p-3 border-1 border-teal-400"
        ></div>
      </div>
    </>
  );
}

export default Viewer;
