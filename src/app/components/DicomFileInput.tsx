"use client";

import React, { useEffect } from "react";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import * as dicomParser from "dicom-parser";

cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

export default function DicomFileInput({
  onMetadataExtracted,
}: {
  onMetadataExtracted: (data: { tag: string; value: string }[]) => void;
}) {
  useEffect(() => {
    const element = document.getElementById("dicom-image");
    if (element) {
      cornerstone.enable(element);
    }
  }, []);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);

    try {
      const image = await cornerstone.loadAndCacheImage(imageId);
      const element = document.getElementById("dicom-image");
      if (element) {
        cornerstone.displayImage(element, image);
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const arrayBuffer = e.target?.result;
          if (!arrayBuffer || typeof arrayBuffer === "string") return;

          const byteArray = new Uint8Array(arrayBuffer);
          const dataSet = dicomParser.parseDicom(byteArray);

          const elements = dataSet.elements;
          const metaList: { tag: string; value: string }[] = [];

          for (const tag in elements) {
            try {
              const value = dataSet.string(tag);
              if (value) {
                metaList.push({
                  tag: tag.toUpperCase(),
                  value,
                });
              }
            } catch {
              // Skip non-string fields
            }
          }

          onMetadataExtracted(metaList);
        } catch (err) {
          console.error("Failed to parse DICOM metadata", err);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error("Failed to load image", err);
    }
  };

  return (
    <input
      type="file"
      accept=".dcm"
      onChange={handleFileChange}
      className="border p-2"
    />
  );
}
