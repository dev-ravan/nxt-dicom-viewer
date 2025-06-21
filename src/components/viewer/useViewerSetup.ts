"use client";

import { useEffect, useRef } from "react";
import { initializeCornerstone } from "./cornerstoneSetup";
import {
  ToolGroupManager,
  Enums as ToolEnums,
  StackScrollTool,
} from "@cornerstonejs/tools";
import {
  RenderingEngine,
  Enums,
  type Types,
  metaData,
} from "@cornerstonejs/core";
import { loadFilesAndGenerateImageIds } from "./loadImageIds";
import { tools, LengthTool } from "./toolsConfig";

export function useViewerSetup(
  elementRef: React.RefObject<HTMLDivElement | null>,
  files: File[],
  activeTool: string,
  setImageIds: (ids: string[]) => void,
  onImageIndexChange: (meta: { tag: string; value: string }[]) => void
) {
  const running = useRef(false);
  const toolGroupRef = useRef<ReturnType<typeof ToolGroupManager.createToolGroup> | null>(null);
  const renderingEngineRef = useRef<RenderingEngine | null>(null);

  useEffect(() => {
    const setup = async () => {
      if (running.current || files.length === 0 || !elementRef.current) return;
      running.current = true;

      // Initialize Cornerstone
      await initializeCornerstone();

      const toolGroupId = "stackToolGroup";
      const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
      if (!toolGroup) {
        console.error("❌ Failed to create tool group");
        return;
      }
      toolGroupRef.current = toolGroup;

      // Add tools
      toolGroup.addTool(StackScrollTool.toolName);
      tools.forEach((tool) => toolGroup.addTool(tool.name));

      // Bind tools to mouse buttons
      toolGroup.setToolActive(StackScrollTool.toolName, {
        bindings: [{ mouseButton: ToolEnums.MouseBindings.Wheel }],
      });

      toolGroup.setToolActive(activeTool || LengthTool.toolName, {
        bindings: [{ mouseButton: ToolEnums.MouseBindings.Primary }],
      });

      tools.forEach((tool) => {
        if (tool.name !== activeTool) {
          toolGroup.setToolPassive(tool.name);
        }
      });

      // Load image stack
      const imageIds = await loadFilesAndGenerateImageIds(files);
      setImageIds(imageIds);

      const renderingEngineId = "myRenderingEngine";
      const viewportId = "US";

      const renderingEngine = new RenderingEngine(renderingEngineId);
      renderingEngineRef.current = renderingEngine;

      renderingEngine.enableElement({
        viewportId,
        type: Enums.ViewportType.STACK,
        element: elementRef.current,
        defaultOptions: {
          orientation: Enums.OrientationAxis.AXIAL,
        },
      });

      const viewport = renderingEngine.getViewport(viewportId) as Types.IStackViewport;
      toolGroup.addViewport(viewportId, renderingEngineId);

      await viewport.setStack(imageIds);
      viewport.render();

      viewport.setImageIdIndex(0); // Ensure first image renders

      // ✅ Listen to image change event
      viewport.element.addEventListener('cornerstoneimagerendered', () => {
        const imageId = viewport.getCurrentImageId();
        const meta = metaData.get("generalSeriesModule", imageId);
        if (meta) {
          const parsed: { tag: string; value: string }[] = Object.entries(meta).map(([key, val]) => ({
            tag: key,
            value: String(val)
          }));
          onImageIndexChange(parsed);
        }
      });
    };

    setup();
  }, [files, activeTool, elementRef]);
}