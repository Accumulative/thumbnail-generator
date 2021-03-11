import type { ThumbnailJob } from '../types';
import { getDatabase } from '../database';

const resizeImage = async (job: ThumbnailJob): Promise<void> => {
  const model = job.attrs.data;
  console.log('Resize job is running for id: ', model._id);
  // TODO: resize logic here

  model.status = 'completed';
  await getDatabase()
    .collection('thumbnailJob')
    .replaceOne({ _id: model._id }, model);
  console.log('Resize job has completed for id: ', model._id);
};

export { resizeImage };
