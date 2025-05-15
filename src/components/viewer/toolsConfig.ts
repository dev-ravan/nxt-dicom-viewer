import {
  Enums as ToolEnums,
  LengthTool,
  PanTool,
  ProbeTool,
  ZoomTool,
} from "@cornerstonejs/tools";

export const tools = [
  {
    name: LengthTool.toolName,
    label: "Length",
    icon: "📏",
    mouseButton: ToolEnums.MouseBindings.Primary,
  },
  {
    name: PanTool.toolName,
    label: "Pan",
    icon: "✋",
    mouseButton: ToolEnums.MouseBindings.Primary,
  },
  {
    name: ZoomTool.toolName,
    label: "Zoom",
    icon: "🔍",
    mouseButton: ToolEnums.MouseBindings.Primary,
  },
  {
    name: ProbeTool.toolName,
    label: "Probe",
    icon: "👆",
    mouseButton: ToolEnums.MouseBindings.Primary,
  },
];

export { ToolEnums, LengthTool, PanTool, ProbeTool, ZoomTool };
