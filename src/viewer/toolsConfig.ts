import { LengthTool, ZoomTool, PanTool, ProbeTool } from "@cornerstonejs/tools";

export const tools = [
  { name: LengthTool.toolName, tool: LengthTool },
  { name: ZoomTool.toolName, tool: ZoomTool },
  { name: PanTool.toolName, tool: PanTool },
  { name: ProbeTool.toolName, tool: ProbeTool },
];

export { LengthTool };
