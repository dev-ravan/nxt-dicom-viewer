"use client";
import React, { useEffect, useRef, useState } from "react";
import { RenderingEngine, Enums, type Types } from "@cornerstonejs/core";
import { init as csRenderInit } from "@cornerstonejs/core";
import {
  init as dicomLoaderInit,
  wadouri,
} from "@cornerstonejs/dicom-image-loader";
import {
  init as toolsInit,
  StackScrollTool,
  ToolGroupManager,
  Enums as ToolEnums,
  addTool,
} from "@cornerstonejs/tools";

function Viewer() {
  const elementRef = useRef<HTMLDivElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const running = useRef(false);

  useEffect(() => {
    const setup = async () => {
      if (running.current || files.length === 0 || !elementRef.current) return;
      running.current = true;

      await csRenderInit();
      await dicomLoaderInit({
        maxWebWorkers: 1,
      });
      toolsInit();
      addTool(StackScrollTool);

      const toolGroup = createToolGroup()

      // Generate imageIds like 'wadouri:example.dcm'
      const imageIds = loadFilesAndGenerateImageIds(files);

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

      // Set image stack and render
      await viewport.setStack(await imageIds);
      viewport.render();
    };

    setup();
  }, [files]);

  // Function to load files and generate imageIds
  const loadFilesAndGenerateImageIds = async (files: File[]) => {
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

  // Function to create tool group
  function createToolGroup() {
    const toolGroupId = "stackToolGroup";
    const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
    // Register the scroll tool
    toolGroup?.addTool(StackScrollTool.toolName);
    toolGroup?.setToolActive(StackScrollTool.toolName, {
      bindings: [
        {
          mouseButton: ToolEnums.MouseBindings.Wheel,
        },
      ],
    });

    return toolGroup;
  }


  return (
    <>
      <div className="flex flex-col gap-4">
        <input
          className="border-1 border-amber-100 p-3"
          type="file"
          multiple
          accept=".dcm"
          onChange={(e) => {
            const selectedFiles = Array.from(e.target.files || []);
            setFiles(selectedFiles);
            running.current = false;
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

