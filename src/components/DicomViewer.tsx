"use client";

import React, { useRef, useState, useEffect } from "react";
import { useViewerSetup } from "../viewer/useViewerSetup";
import DicomFileInput from "./DicomFileInput";
import DicomMetadata from ".//DicomMetadata";
import * as cornerstone from "@cornerstonejs/core";

export default function DicomViewer() {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  const [activeTool, setActiveTool] = useState("Length");

  useViewerSetup(elementRef, files, activeTool, setImageIds);

  // Update metadata on image change
  useEffect(() => {
    if (imageIds.length === 0) return;

    const loadMeta = async () => {
      const imageId = imageIds[0];
      const image = await cornerstone.imageLoader.loadImage(imageId);
      const meta = cornerstone.metaData.get("generalSeriesModule", imageId) || {};
      setMetadata({
        "Patient Name": meta.patientName,
        "Patient ID": meta.patientID,
        "Study Date": meta.studyDate,
        "Modality": meta.modality,
        "Hospital Name": meta.institutionName,
      });
    };

    loadMeta();
  }, [imageIds]);

  return (
    <div className="flex gap-4 p-4">
      <div className="w-2/3">
        <DicomFileInput onFilesSelected={setFiles} />
        <div ref={elementRef} className="w-full h-[512px] bg-black" />
      </div>
      <div className="w-1/3 bg-gray-100 p-4 rounded shadow">
        <DicomMetadata metadata={metadata} />
      </div>
    </div>
  );
}
