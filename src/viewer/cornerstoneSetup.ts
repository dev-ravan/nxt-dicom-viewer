import { init as csRenderInit } from "@cornerstonejs/core";
import { init as toolsInit } from "@cornerstonejs/tools";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import * as cornerstone from "@cornerstonejs/core";

let initialized = false;

export async function initializeCornerstone() {
  if (initialized) return;

  // ✅ 1. Initialize core
  await csRenderInit(); // This is required before creating RenderingEngine

  // ✅ 2. Initialize WADO loader
  cornerstoneWADOImageLoader.configure({
    useWebWorkers: true,
  });

  cornerstone.metaData.addProvider(
    cornerstoneWADOImageLoader.wadouri.metaDataProvider
  );

  // ✅ 3. Initialize tools
  await toolsInit();

  initialized = true;
}
