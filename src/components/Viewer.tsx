/* eslint-disable @typescript-eslint/no-explicit-any */
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
  StackScrollTool,
  ToolGroupManager,
  addTool,
  Enums as ToolEnums,
} from "@cornerstonejs/tools";

function Viewer() {
  const elementRef = useRef<HTMLDivElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const running = useRef(false);
  const imageIdsRef = useRef<string[]>([]); // Store imageIds for use in event listeners

  useEffect(() => {
    const setup = async () => {
      if (running.current || files.length === 0 || !elementRef.current) return;
      running.current = true;

      await csRenderInit();
      await dicomLoaderInit({
        maxWebWorkers: 1,
      });
      await toolsInit();

      // Add the scroll tool
      addTool(StackScrollTool);

      const toolGroupId = "stackToolGroup";
      const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);

      // Register the scroll tool
      toolGroup?.addTool(StackScrollTool.toolName);

      // Set the tool as active with proper mouse wheel binding
      toolGroup?.setToolActive(StackScrollTool.toolName, {
        bindings: [
          {
            mouseButton: ToolEnums.MouseBindings.Wheel,
          },
        ],
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

      // Set up event listener for image changes to update metadata
      const imageRenderedCallback = (event: any) => {
        const eventData = event.detail;
        const imageId = eventData.imageIds?.[0] || eventData.imageId;

        if (imageId) {
          const index = imageIdsRef.current.indexOf(imageId);
          if (index !== -1) {
            setCurrentImageIndex(index);

            // Extract metadata for the current image
            try {
              const dicomMetaData: Record<string, any> = {};

              // Common DICOM tags to display
              const tags = [
                { name: "Patient Name", tag: "00100010" },
                { name: "Patient ID", tag: "00100020" },
                { name: "Patient Birth Date", tag: "00100030" },
                { name: "Study Date", tag: "00080020" },
                { name: "Study Time", tag: "00080030" },
                { name: "Study Description", tag: "00081030" },
                { name: "Series Description", tag: "0008103E" },
                { name: "Modality", tag: "00080060" },
                { name: "Image Number", tag: "00200013" },
                { name: "Rows", tag: "00280010" },
                { name: "Columns", tag: "00280011" },
                { name: "Slice Thickness", tag: "00180050" },
                { name: "Pixel Spacing", tag: "00280030" },
              ];

              tags.forEach(({ name, tag }) => {
                try {
                  const value = metaData.get("dicomParser", imageId, tag);
                  if (value !== undefined) {
                    dicomMetaData[name] = value;
                  }
                } catch (error) {
                  console.log(`Error getting metadata for ${name}:`, error);
                }
              });

              setMetadata(dicomMetaData);
            } catch (error) {
              console.error("Error retrieving metadata:", error);
            }
          }
        }
      };

      // Remove existing event listeners if any
      elementRef.current.removeEventListener(
        "cornerstoneimagerendered",
        imageRenderedCallback
      );
      // Add the event listener
      elementRef.current.addEventListener(
        "cornerstoneimagerendered",
        imageRenderedCallback
      );

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
            setMetadata({});
            running.current = false; // Reset running flag to allow reinitialization
          }}
        />

        {/* Metadata Panel */}
        <div className="p-3 border border-blue-400 overflow-y-auto">
          <h3 className="text-lg font-bold mb-2">DICOM Metadata</h3>
          {files.length > 0 ? (
            <>
              <p className="mb-2 text-sm">
                Image {currentImageIndex + 1} of {files.length}
              </p>
              <div className="space-y-1">
                {Object.entries(metadata).length > 0 ? (
                  Object.entries(metadata).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-2 text-sm">
                      <span className="font-medium">{key}:</span>
                      <span>{value?.toString() || "N/A"}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">
                    No metadata available or loading...
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-500 italic">
              Upload DICOM files to view metadata
            </p>
          )}
        </div>

        <div
          ref={elementRef}
          className="h-[600px] p-3 border-1 border-teal-400"
        ></div>
      </div>
    </>
  );
}

export default Viewer;