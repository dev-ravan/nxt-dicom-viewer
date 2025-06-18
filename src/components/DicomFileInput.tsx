"use client";

import React from "react";

type Props = {
  onFilesSelected: (files: File[]) => void;
};

export default function DicomFileInput({ onFilesSelected }: Props) {
  return (
    <div className="p-2">
      <input
        type="file"
        accept=".dcm"
        multiple
        onChange={(e) => {
          const files = e.target.files ? Array.from(e.target.files) : [];
          onFilesSelected(files);
        }}
      />
    </div>
  );
}
