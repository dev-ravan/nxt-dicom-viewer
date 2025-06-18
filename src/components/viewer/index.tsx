"use client";

import React, { useRef, useState } from "react";
import DicomFileInput from "./DicomFileInput";
import DicomMetadata from "./DicomMetadata";
import { useViewerSetup } from "./useViewerSetup";
import { tools } from "./toolsConfig";
import { useToolChange } from "./useToolChange";

const HIGHLIGHTED_TAGS: { [tag: string]: string } = {
  "0010,0010": "Patient Name",
  "0010,0020": "Patient ID",
  "0008,0080": "Hospital Name",
  "0008,0020": "Study Date",
  "0008,0030": "Study Time",
  "0008,0060": "Modality",
  "0018,5010": "Probe Type",
};

export default function Viewer() {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [activeTool, setActiveTool] = useState(tools[0].name);
  const [, setImageIds] = useState<string[]>([]);
  const [highlightedData, setHighlightedData] = useState<{ label: string; value: string }[]>([]);
  const [otherMetaData, setOtherMetaData] = useState<{ label: string; value: string }[]>([]);
  const { handleToolChange } = useToolChange("stackToolGroup");

  useViewerSetup(viewerRef, files, activeTool, setImageIds);

  const handleMetadata = (metaDataList: { tag: string; value: string }[]) => {
    const highlights: { label: string; value: string }[] = [];
    const others: { label: string; value: string }[] = [];
    let fieldCounter = 1;

    for (const item of metaDataList) {
      const normalizedTag = item.tag.replace(/^X/, "").replace(/(.{4})(.{4})/, "$1,$2");
      const label = HIGHLIGHTED_TAGS[normalizedTag];
      const cleanedValue = item.value.replace(/[^\x20-\x7E]/g, "").trim();
      if (!cleanedValue) continue;

      if (label) highlights.push({ label, value: cleanedValue });
      else others.push({ label: `Field ${fieldCounter++}`, value: cleanedValue });
    }

    setHighlightedData(highlights);
    setOtherMetaData(others);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-amber-700">DICOM Viewer</h1>
      <DicomFileInput onFilesSelected={setFiles} onMetadataExtracted={handleMetadata} />

      <div className="flex flex-row gap-4 pt-4">
        <div className="w-[1200px] h-[800px] bg-black">
          <div ref={viewerRef} className="w-full h-full" />
        </div>

        <div className="flex-1 overflow-auto max-h-[800px] space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Patient Info</h2>
            {highlightedData.length === 0 ? (
              <p>No key metadata found</p>
            ) : (
              <ul className="text-sm">
                {highlightedData.map((item, index) => (
                  <li key={index}><strong>{item.label}:</strong> {item.value}</li>
                ))}
              </ul>
            )}
          </div>
          <DicomMetadata metaDataList={otherMetaData} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-2 mt-4 bg-gray-100 rounded">
        {tools.map((tool) => (
          <button
            key={tool.name}
            className={`px-3 py-2 rounded ${
              activeTool === tool.name ? "bg-teal-500 text-white" : "bg-white hover:bg-gray-200"
            }`}
            onClick={() => {
              setActiveTool(tool.name);
              handleToolChange(tool.name, setActiveTool);
            }}
          >
            {tool.icon} {tool.label}
          </button>
        ))}
      </div>
    </div>
  );
}
