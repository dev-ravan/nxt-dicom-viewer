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
    const file = event.target.files?.[0];
    if (!file) return;

    onFilesSelected([file]);

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const arrayBuffer = e.target?.result;
        if (!arrayBuffer || typeof arrayBuffer === "string") return;

        const byteArray = new Uint8Array(arrayBuffer);
        const dataSet = dicomParser.parseDicom(byteArray);
        const metaList: { tag: string; value: string }[] = [];

        for (const tag in dataSet.elements) {
          try {
            const value = dataSet.string(tag);
            if (value) {
              metaList.push({ tag: tag.toUpperCase(), value });
            }
          } catch {}
        }

        onMetadataExtracted(metaList);
      } catch (err) {
        console.error("Failed to parse metadata", err);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return <input type="file" accept=".dcm" onChange={handleFileChange} className="border p-2" />;
}
