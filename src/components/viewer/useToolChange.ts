import { useRef } from "react";
import { ToolGroupManager } from "@cornerstonejs/tools";
import { RenderingEngine } from "@cornerstonejs/core";
import { tools } from "./toolsConfig";

export function useToolChange(
  toolGroupId: string,
) {
  const renderingEngineRef = useRef<RenderingEngine | null>(null);

  const handleToolChange = (toolName: string, setActiveTool: (name: string) => void) => {
    const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
    if (!toolGroup) return;

    // Deactivate all current primary tools
    tools.forEach((tool) => {
      toolGroup.setToolPassive(tool.name);
    });

    // Set new active tool
    toolGroup.setToolActive(toolName, {
      bindings: [{ mouseButton: 1 }],
    });

    setActiveTool(toolName);

    // Re-render if viewport exists
    const renderingEngine = renderingEngineRef.current;
    if (renderingEngine) {
      const viewport = renderingEngine.getViewport("US");
      if (viewport) {
        viewport.render();
      }
    }
  };

  return { handleToolChange, renderingEngineRef };
}
