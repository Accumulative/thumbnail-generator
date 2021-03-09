import * as Agenda from 'agenda';
import { resizeImage } from './jobs/thumbnail';

const mongoConnectionString = 'mongodb://db/thumbnailDB';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const agenda = new (Agenda as any)({
  db: { address: mongoConnectionString, collection: 'agenda', options: {} }
});

const TASK_TYPES = {
  RESIZE_IMAGE: 'resize'
};

agenda.define(TASK_TYPES.RESIZE_IMAGE, resizeImage);

export { agenda, TASK_TYPES };
