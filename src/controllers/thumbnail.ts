import { Request, Response } from 'express';
import { agenda, TASK_TYPES } from '../worker';

const createResizeImageJob = async (
  _: Request,
  res: Response
): Promise<void> => {
  console.log('Thumbnail job received');
  const job = await agenda.now(TASK_TYPES.RESIZE_IMAGE, { image: 'test' });
  res.status(200).send({ data: job });
};

const getResizeImageJob = async (
  req: Request,
  res: Response
): Promise<void> => {
  const job = await agenda.jobs({
    name: TASK_TYPES.RESIZE_IMAGE,
    _id: req.params.id
  });
  if (job.length > 0) {
    res.status(200).send({ data: job[0] });
  } else {
    res.status(400).send({ error: 'Job not found' });
  }
};

export { createResizeImageJob, getResizeImageJob };
