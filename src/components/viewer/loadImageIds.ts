import { wadouri } from "@cornerstonejs/dicom-image-loader";

export async function loadFilesAndGenerateImageIds(files: File[]) {
  const imageIds: string[] = [];
  for (const file of files) {
    const objectUrl = URL.createObjectURL(file);
    wadouri.fileManager.add(file);
    imageIds.push(`wadouri:${objectUrl}`);
  }
  return imageIds;
}
