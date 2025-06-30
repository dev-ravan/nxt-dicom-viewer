"use client";

import React, { useState } from "react";
import DicomFileInput from "./DicomFileInput";
import DicomMetadata from "./DicomMetadata";

// Tags of interest (uppercase format)
const HIGHLIGHTED_TAGS: { [tag: string]: string } = {
  "0008,0080": "Hospital Name",
  "0010,0010": "Patient Name",
  "0010,0020": "Patient ID",
  "0008,0020": "Study Date",
  "0008,0030": "Study Time",
  "0008,0060": "Modality",
  "0008,1030": "Study description",
  "0008,0090": "Referring Physician's Name"
};

export default function DicomViewer() {
  const normalizeTag = (rawTag: string): string => {
    if (rawTag.startsWith("X") && rawTag.length === 9) {
      return `${rawTag.slice(1, 5)},${rawTag.slice(5)}`;
    }
    return rawTag;
  };

  const [highlightedData, setHighlightedData] = useState<
    { label: string; value: string }[]
  >([]);
  const [otherMetaData, setOtherMetaData] = useState<
    { label: string; value: string }[]
  >([]);

const handleMetadata = (metaDataList: { tag: string; value: string }[]) => {
  const highlights: { label: string; value: string }[] = [];
  const others: { label: string; value: string }[] = [];
  let fieldCounter = 1;

  for (const item of metaDataList) {
    const normalizedTag = normalizeTag(item.tag.toUpperCase());
    const label = HIGHLIGHTED_TAGS[normalizedTag];
    const cleanedValue = item.value.replace(/[^\x20-\x7E]/g, "").trim();

    if (!cleanedValue) continue;

    if (label) {
      highlights.push({ label, value: cleanedValue });
    } else {
      // Skip Field 27
      if (fieldCounter === 27) {
        fieldCounter++;
        continue;
      }
      others.push({ label: `Field ${fieldCounter++}`, value: cleanedValue });
    }
  }

  setHighlightedData(highlights);
  setOtherMetaData(others);
};



  return (
    <div className="p-4">
      <h1 className="text-amber-700 font-bold text-2xl pb-4">DICOM VIEWER</h1>

      <div className="mb-4">
        <DicomFileInput onMetadataExtracted={handleMetadata} />
      </div>

      <div className="flex flex-row gap-6">
        {/* DICOM image viewer */}
        <div className="w-[1500px] h-[800px] bg-black">
          <div
            id="dicom-image"
            className="w-full h-full"
            tabIndex={0}
            style={{ outline: "none" }}
          />
        </div>

        {/* Metadata display */}
        <div className="flex-1 overflow-auto max-h-[800px] space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Patient Information</h2>
            {highlightedData.length === 0 ? (
              <p>No key metadata found</p>
            ) : (
              <ul className="text-sm">
                {highlightedData.map((item, index) => (
                  <li key={index}>
                    <strong>{item.label}:</strong> {item.value}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <DicomMetadata metaDataList={otherMetaData} />
        </div>
      </div>
    </div>
  );
}
