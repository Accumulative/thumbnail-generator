import { Request, Response } from 'express';
import { agenda, TASK_TYPES } from '../worker';
import { putFile, getFileLink, getFile } from '../storage';
import { getDatabase } from '../database';
import { v4 as uuidv4 } from 'uuid';
import type {
  ThumbnailJobData,
  GetThumbnailJobResponse,
  PostFileRequest
} from '../types';

// POST /thumbnail
const createResizeImageJob = async (
  req: PostFileRequest,
  res: Response
): Promise<void> => {
  if (!req.file) {
    res.status(400).send({ error: 'Please supply an image' });
    return;
  }

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
      // create a record in the database so the user can get updates
      getDatabase().collection('thumbnailJob').insertOne(thumbnailJob);
      // create a job for the worker to pickup, scheduled from now
      await agenda.now(TASK_TYPES.RESIZE_IMAGE, thumbnailJob);
      // include job_id in response which can be used to retrieve the result thumbnail
      res.status(200).send({ data: { job_id: uuid } });
    } else {
      res.status(400).send({ error: 'Error occurred' });
    }
  } catch (error) {
    console.error('Create resize job failed: ', error);
    res.status(400).send({ error: 'Error occurred' });
  }
};

// GET /thumbnail/:id
const getResizeImageJob = async (
  req: Request,
  res: Response
): Promise<void> => {
  const job: ThumbnailJobData | null = await getDatabase()
    .collection('thumbnailJob')
    .findOne({ _id: req.params.id });
  if (job) {
    const responseData: GetThumbnailJobResponse = { ...job, thumbnailLink: '' };

    // include a presigned url to the thumbnail if the resize job has completed
    if (job.status === 'complete') {
      responseData.thumbnailLink = await getFileLink(job.thumbnailFilename);
    }
    res.status(200).send({ data: responseData });
  } else {
    res.status(400).send({ error: 'Job not found' });
  }
};

// GET /thumbnail/:id/image
const getResizeImageJobDownload = async (
  req: Request,
  res: Response
): Promise<void> => {
  const job: ThumbnailJobData | null = await getDatabase()
    .collection('thumbnailJob')
    .findOne({ _id: req.params.id });
  if (job) {
    // send the image directly for convenience
    const thumbnailStream = await getFile(job.thumbnailFilename, false);
    if (thumbnailStream) {
      (thumbnailStream as NodeJS.ReadableStream).pipe(res);
    } else {
      res.status(400).send({ error: 'Image not found' });
    }
  } else {
    res.status(400).send({ error: 'Job not found' });
  }
};

export { createResizeImageJob, getResizeImageJob, getResizeImageJobDownload };
