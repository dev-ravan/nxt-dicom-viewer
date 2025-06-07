"use client";

import React, { useEffect } from "react";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import * as dicomParser from "dicom-parser";
import * as cornerstoneMath from "cornerstone-math";
import * as cornerstoneTools from "cornerstone-tools";
import Hammer from "hammerjs";
import { extractMetaFromFile } from "../lib/extractMetaFromFile";

cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;

export default function DicomFileInput({
  onMetadataExtracted,
}: {
  onMetadataExtracted: (data: { tag: string; value: string }[]) => void;
}) {
  useEffect(() => {
    const element = document.getElementById("dicom-image");
    if (element) {
      cornerstone.enable(element);

      if (!(window as any)._cornerstoneToolsInitialized) {
        cornerstoneTools.init();
        cornerstoneTools.addTool(cornerstoneTools.StackScrollMouseWheelTool);
        cornerstoneTools.setToolActive("StackScrollMouseWheel", {}); 
        (window as any)._cornerstoneToolsInitialized = true;
      }
    }
  }, []);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const imageIds = Array.from(files).map(file =>
      cornerstoneWADOImageLoader.wadouri.fileManager.add(file)
    );

    const element = document.getElementById("dicom-image");
    if (!element) return;

    const stack = {
      currentImageIdIndex: 0,
      imageIds,
    };

    const firstImage = await cornerstone.loadAndCacheImage(imageIds[0]);
    cornerstone.displayImage(element, firstImage);

    cornerstoneTools.addStackStateManager(element, ["stack"]);
    cornerstoneTools.addToolState(element, "stack", stack);

    extractMetaFromFile(files[0], onMetadataExtracted);

    //  Update metadata on scroll
    element.addEventListener("cornerstoneimagerendered", () => {
      const stackData = cornerstoneTools.getToolState(element, "stack")?.data?.[0];
      const index = stackData?.currentImageIdIndex ?? 0;
      if (files[index]) {
        extractMetaFromFile(files[index], onMetadataExtracted);
      }
    });
  };

  return (
    <input
      type="file"
      accept=".dcm"
      onChange={handleFileChange}
      multiple
      className="border p-2"
    />
  );
}
