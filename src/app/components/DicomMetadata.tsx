import React from "react";

type MetaDataItem = {
  label: string;
  value: string;
};

export default function DicomMetadata({
  metaDataList = [],
}: {
  metaDataList?: MetaDataItem[];
}) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Other Metadata</h2>
      {metaDataList.length === 0 ? (
        <p>No metadata found</p>
      ) : (
        <ul className="text-sm space-y-1">
          {metaDataList.map((item, index) => (
            <li key={index}>
              <strong>{item.label}:</strong> {item.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
