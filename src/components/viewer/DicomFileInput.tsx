"use client";

import React from "react";
import * as dicomParser from "dicom-parser";

export default function DicomFileInput({
  onFilesSelected,
  onMetadataExtracted,
}: {
  onFilesSelected: (files: File[]) => void;
  onMetadataExtracted: (data: { tag: string; value: string }[]) => void;
}) {
const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(event.target.files || []);
  if (files.length === 0) return;

  onFilesSelected(files);

  const reader = new FileReader();
  const metaList: { tag: string; value: string }[] = [];

  let fileIndex = 0;

  const processFile = () => {
    if (fileIndex >= files.length) {
      onMetadataExtracted(metaList);
      return;
    }

    const file = files[fileIndex++];
    reader.onload = function (e) {
      try {
        const arrayBuffer = e.target?.result;
        if (!arrayBuffer || typeof arrayBuffer === "string") return;

        const byteArray = new Uint8Array(arrayBuffer);
        const dataSet = dicomParser.parseDicom(byteArray);

        for (const tag in dataSet.elements) {
          try {
            const value = dataSet.string(tag);
            if (value) {
              metaList.push({ tag: tag.toUpperCase(), value });
            }
          } catch {}
        }

        processFile();
      } catch (err) {
        console.error("Failed to parse metadata", err);
        processFile();
      }
    };

    reader.readAsArrayBuffer(file);
  };

  processFile();
};


  return (
<input
  type="file"
  accept=".dcm"
  multiple
  onChange={handleFileChange}
  onClick={(e) => ((e.target as HTMLInputElement).value = "")}
  className="border p-2"
/>
)
}
