import express from 'express';
import { Application, Request, Response } from 'express';
import {
  createResizeImageJob,
  getResizeImageJob
} from './controllers/thumbnail';
import multer from 'multer';
import { PostFileRequest } from './types';

const app: Application = express();
app.use(express.json({ limit: '20mb' }));

const port = 3000;

app.get('/', (_: Request, res: Response) => {
  res.status(200).send({ data: 'Hello from Thumbnail Generator' });
});

// file middleware
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req: PostFileRequest, file, cb) => {
    if (
      file.mimetype == 'image/png' ||
      file.mimetype == 'image/jpg' ||
      file.mimetype == 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      req.fileValidationError =
        'Please supply an image with the .png, .jpg or .jpeg extension';
    }
  }
}).single('upload');

// Thumbnail resize controller
app.post('/thumbnail', upload, createResizeImageJob);
app.get('/thumbnail/:id', getResizeImageJob);

app.listen(port, () => console.log(`Server is listening on port ${port}`));
