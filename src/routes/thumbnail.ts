import { Router } from 'express';
import {
  createResizeImageJob,
  getResizeImageJob,
  getResizeImageJobDownload
} from '../controllers/thumbnail';
import { fileMiddleware } from '../middleware';

const router = Router();

router.post('/', fileMiddleware, createResizeImageJob);
router.get('/:id', getResizeImageJob);
router.get('/:id/image', getResizeImageJobDownload);

export default router;
