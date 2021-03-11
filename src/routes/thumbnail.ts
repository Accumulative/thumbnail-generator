import { Router } from 'express';
import {
  createResizeImageJob,
  getResizeImageJob,
  getResizeImageJobDownload
} from '../controllers/thumbnail';
import { fileMiddleware } from '../middleware';

const router = Router();

// Post an image to be turned into a 100x100 thumbnail
router.post('/', fileMiddleware, createResizeImageJob);
// Get updates and also a presigned url when complete.
router.get('/:id', getResizeImageJob);
// Get the thumbnail directly
router.get('/:id/image', getResizeImageJobDownload);

export default router;
