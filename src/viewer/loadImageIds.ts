import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';

export async function loadFilesAndGenerateImageIds(files: File[]): Promise<string[]> {
  const imageIds: string[] = [];

  await cornerstoneWADOImageLoader.webWorkerManager.initialize({
    taskConfiguration: {
      decodeTask: {
        codecsPath: "/cornerstoneWADOImageLoaderCodecs.js",
      },
    },
  });

  for (const file of files) {
    const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
    imageIds.push(`wadouri:${imageId}`);
  }

  return imageIds;
}
