import Agenda from 'agenda';
import { resizeImage } from './jobs/thumbnail';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const agenda = new (Agenda as any)({
  db: {
    address: process.env.MONGO_URL,
    collection: 'agenda',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  }
});

const TASK_TYPES = {
  RESIZE_IMAGE: 'resize'
};

agenda.define(TASK_TYPES.RESIZE_IMAGE, resizeImage);

export { agenda, TASK_TYPES };
