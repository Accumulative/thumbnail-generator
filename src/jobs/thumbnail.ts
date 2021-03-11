import type { ThumbnailJob, ThumbnailJobData } from '../types';
import { getDatabase } from '../database';
import { getFile, putFile } from '../storage';
import sharp from 'sharp';

// generic error handling function, which updates the job record status to failed
const processingError = async (model: ThumbnailJobData, error: string) => {
  console.error(error, model.filename);
  model.status = 'failed';
  await getDatabase()
    .collection('thumbnailJob')
    .replaceOne({ _id: model._id }, model);
};

// the resize image job, spawned from the thumbnail controller
const resizeImage = async (job: ThumbnailJob): Promise<void> => {
  let resized: Buffer;
  let model: ThumbnailJobData;
  try {
    model = job.attrs.data;
    console.log('Resize job is running for id: ', model._id);

    // get the uploaded file
    const fileResult = await getFile(model.filename);
    if (!fileResult) {
      return await processingError(model, "Couldn't access file");
    }
    // perform deeper validation on the file
    const image = sharp(fileResult as Buffer, { failOnError: true });
    const metadata = await image.metadata();
    if (!metadata.width || !metadata.height) {
      return await processingError(model, 'Width and Height are not available');
    }
    // resize the image using fill (doesnt preserve aspect ratio)
    resized = await image.resize(100, 100, { fit: sharp.fit.fill }).toBuffer();
  } catch (error) {
    return await processingError(model, error);
  }

  // mark job as complete
  model.status = 'complete';
  model.thumbnailFilename = `100px_${model.filename}`;

  // save the thumbnail so the user can retrieve it at a later date
  await putFile(model.thumbnailFilename, resized);
  // update the job record with the 'complete' status and new thumbnail filename
  await getDatabase()
    .collection('thumbnailJob')
    .replaceOne({ _id: model._id }, model);
  console.log('Resize job has completed for id: ', model._id);
};

export { resizeImage };
