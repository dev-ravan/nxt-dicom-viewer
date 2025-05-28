"use client";
import React, { useRef, useState } from "react";
import { useViewerSetup } from "./useViewerSetup";
import { tools } from "./toolsConfig";
import { useToolChange } from "./useToolChange";

const Viewer = () => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [activeTool, setActiveTool] = useState<string>(tools[0].name);
  // we only need the *setter* here – the value itself isn’t read
  const [, setImageIds] = useState<string[]>([]);
  const { handleToolChange } = useToolChange("stackToolGroup");

  useViewerSetup(elementRef, files, activeTool, setImageIds);

  function handleFilePick(event: React.ChangeEvent<HTMLInputElement>) {
    
    if (files != null) {
      setFiles([])
    }
    setFiles(Array.from(event.target.files||[]))

  }

  return (
    <div className="flex flex-col gap-4">
      <input
        className="border border-amber-100 p-3"
        type="file"
        multiple
        accept=".dcm"
        onChange={(e) => handleFilePick(e)}
      />

      <div className="flex flex-wrap gap-2 p-2 bg-[#1E1E1E] rounded">
        {tools.map((tool) => (
          <button
            key={tool.name}
            className={`px-3 py-2 rounded flex items-center gap-1 ${
              activeTool === tool.name
                ? "bg-teal-500 text-white"
                : "bg-black hover:bg-gray-200"
            }`}
            onClick={() => {
              setActiveTool(tool.name);
              handleToolChange(tool.name, setActiveTool);
            }}
            title={tool.label}
          >
            <span>{tool.icon}</span>
            <span>{tool.label}</span>
          </button>
        ))}
      </div>

      <div ref={elementRef} className="h-[600px] p-3 border border-teal-400" />
    </div>
  );
};

export default Viewer;
