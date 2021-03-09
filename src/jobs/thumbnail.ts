import type { Job } from '../types';

const resizeImage = (job: Job): void => {
  console.log('Resize job is running', job);
};

export { resizeImage };
