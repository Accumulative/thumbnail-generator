import { Request, Response } from 'express';
import { agenda, TASK_TYPES } from '../worker';
import { getDatabase } from '../database';
import { putFile } from '../storage';
import { v4 as uuidv4 } from 'uuid';
import type { PostFileRequest } from '../types';

const createResizeImageJob = async (
  req: PostFileRequest,
  res: Response
): Promise<void> => {
  if (req.fileValidationError) {
    res.status(400).send({ error: req.fileValidationError });
    return;
  }
  try {
    const uuid = uuidv4();
    const extension = req.file.originalname.split('.').pop();
    const filename = `${uuid}.${extension}`;
    const fileResult = putFile(filename, req.file.buffer);
    if (fileResult) {
      const thumbnailJob = {
        _id: uuid,
        filename,
        originalFilename: req.file.originalname,
        status: 'waiting',
        thumbnailFilename: ''
      };

      getDatabase().collection('thumbnailJob').insertOne(thumbnailJob);
      await agenda.now(TASK_TYPES.RESIZE_IMAGE, thumbnailJob);
      res.status(200).send({ data: { job_id: uuid } });
    } else {
      res.status(400).send({ error: 'Error occurred' });
    }
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
