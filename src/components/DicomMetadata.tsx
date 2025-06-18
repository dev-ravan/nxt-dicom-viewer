"use client";

type Props = {
  metadata?: Record<string, string | number | undefined>;
};

export default function DicomMetadata({ metadata = {} }: Props) {
  return (
    <div className="p-4 text-sm">
      {Object.entries(metadata).map(([key, value]) => (
        <div key={key}>
          <strong>{key}:</strong> {value?.toString() ?? "N/A"}
        </div>
      ))}
    </div>
  );
}
