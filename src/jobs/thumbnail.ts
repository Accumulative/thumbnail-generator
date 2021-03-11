import type { ThumbnailJob } from '../types';
import { getDatabase } from '../database';
import { getFile, putFile } from '../storage';
import sharp from 'sharp';

const resizeImage = async (job: ThumbnailJob): Promise<void> => {
  const model = job.attrs.data;
  console.log('Resize job is running for id: ', model._id);
  const fileResult = await getFile(model.filename);
  if (!fileResult) {
    console.error("Couldn't access file: ", model.filename);
  }
  const resized = await sharp(fileResult as Buffer)
    .resize(100, 100, { fit: sharp.fit.fill })
    .toBuffer();
  model.status = 'complete';
  model.thumbnailFilename = `100px_${model.filename}`;
  await putFile(model.thumbnailFilename, resized);
  await getDatabase()
    .collection('thumbnailJob')
    .replaceOne({ _id: model._id }, model);
  console.log('Resize job has completed for id: ', model._id);
};

export { resizeImage };
