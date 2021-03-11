import type { ThumbnailJob } from '../types';
import { getDatabase } from '../database';
import { getFile } from '../storage';

const resizeImage = async (job: ThumbnailJob): Promise<void> => {
  const model = job.attrs.data;
  console.log('Resize job is running for id: ', model._id);
  const fileResult = await getFile(model.filename);
  if (!fileResult) {
    console.error("Couldn't access file: ", model.filename);
  }

  // TODO: resize logic here

  model.status = 'completed';
  await getDatabase()
    .collection('thumbnailJob')
    .replaceOne({ _id: model._id }, model);
  console.log('Resize job has completed for id: ', model._id);
};

export { resizeImage };
