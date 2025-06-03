import * as dicomParser from "dicom-parser";

export function extractMetaFromFile(
  file: File,
  onExtracted: (metaList: { tag: string; value: string }[]) => void
) {
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
            metaList.push({ tag: tag.toUpperCase(), value });
          }
        } catch {}
      }

      onExtracted(metaList);
    } catch (err) {
      console.error("Metadata extraction failed", err);
    }
  };

  reader.readAsArrayBuffer(file);
}
