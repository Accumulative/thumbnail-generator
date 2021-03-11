import type { ThumbnailJob, ThumbnailJobData } from '../types';
import { getDatabase } from '../database';
import { getFile, putFile } from '../storage';
import sharp from 'sharp';

const processingError = async (model: ThumbnailJobData, error: string) => {
  console.error(error, model.filename);
  model.status = 'failed';
  await getDatabase()
    .collection('thumbnailJob')
    .replaceOne({ _id: model._id }, model);
};

const resizeImage = async (job: ThumbnailJob): Promise<void> => {
  let resized: Buffer;
  let model: ThumbnailJobData;
  try {
    model = job.attrs.data;
    console.log('Resize job is running for id: ', model._id);
    const fileResult = await getFile(model.filename);
    if (!fileResult) {
      return await processingError(model, "Couldn't access file");
    }
    const image = sharp(fileResult as Buffer, { failOnError: true });
    const metadata = await image.metadata();
    if (!metadata.width || !metadata.height) {
      return await processingError(model, 'Width and Height are not available');
    }

    resized = await image.resize(100, 100, { fit: sharp.fit.fill }).toBuffer();
  } catch (error) {
    return await processingError(model, error);
  }

  model.status = 'complete';
  model.thumbnailFilename = `100px_${model.filename}`;
  await putFile(model.thumbnailFilename, resized);
  await getDatabase()
    .collection('thumbnailJob')
    .replaceOne({ _id: model._id }, model);
  console.log('Resize job has completed for id: ', model._id);
};

export { resizeImage };
