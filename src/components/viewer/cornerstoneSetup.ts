import { init as csRenderInit } from "@cornerstonejs/core";
import {
  init as dicomLoaderInit,
} from "@cornerstonejs/dicom-image-loader";
import {
  init as toolsInit,
  addTool,
  StackScrollTool,
  PanTool,
  ZoomTool,
  LengthTool,
  ProbeTool,
} from "@cornerstonejs/tools";

export async function initializeCornerstone() {
  await csRenderInit();
  await dicomLoaderInit({ maxWebWorkers: 1 });
  await toolsInit();

  addTool(StackScrollTool);
  addTool(PanTool);
  addTool(ZoomTool);
  addTool(LengthTool);
  addTool(ProbeTool);
}
