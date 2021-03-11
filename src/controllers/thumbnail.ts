import { Request, Response } from 'express';
import { agenda, TASK_TYPES } from '../worker';
import { getDatabase } from '../database';
import { v4 as uuidv4 } from 'uuid';

const createResizeImageJob = async (
  _: Request,
  res: Response
): Promise<void> => {
  // TODO: file validaton

  try {
    const uuid = uuidv4();
    const extension = 'test.png'.split('.').pop();
    const filename = `${uuid}.${extension}`;

    // TODO: save file to storage

    const thumbnailJob = {
      _id: uuid,
      filename,
      originalFilename: '',
      status: 'waiting',
      thumbnailFilename: ''
    };

    getDatabase().collection('thumbnailJob').insertOne(thumbnailJob);
    await agenda.now(TASK_TYPES.RESIZE_IMAGE, thumbnailJob);
    res.status(200).send({ data: { job_id: uuid } });
  } catch (error) {
    console.error('Create resize job failed: ', error);
    res.status(400).send({ error: 'Error occurred' });
  }
};

const getResizeImageJob = async (
  req: Request,
  res: Response
): Promise<void> => {
  const job = await getDatabase()
    .collection('thumbnailJob')
    .findOne({ _id: req.params.id });
  if (job) {
    res.status(200).send({ data: job });
  } else {
    res.status(400).send({ error: 'Job not found' });
  }
};

export { createResizeImageJob, getResizeImageJob };
