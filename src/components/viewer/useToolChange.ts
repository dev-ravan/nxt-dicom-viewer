import { useRef } from "react";
import { ToolGroupManager } from "@cornerstonejs/tools";
import { RenderingEngine } from "@cornerstonejs/core";
import { tools } from "./toolsConfig";

export function useToolChange(toolGroupId: string) {
  const renderingEngineRef = useRef<RenderingEngine | null>(null);

  const handleToolChange = (toolName: string, setActiveTool: (name: string) => void) => {
    const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
    if (!toolGroup) return;

    tools.forEach((tool) => toolGroup.setToolPassive(tool.name));
    toolGroup.setToolActive(toolName, { bindings: [{ mouseButton: 1 }] });
    setActiveTool(toolName);
  };

  return { handleToolChange, renderingEngineRef };
}
