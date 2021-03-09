import * as express from 'express';
import { Application, Request, Response } from 'express';
import {
  createResizeImageJob,
  getResizeImageJob
} from './controllers/thumbnail';

const app: Application = express();
const port = 3000;

app.get('/', (_: Request, res: Response) => {
  res.status(200).send({ data: 'Hello from Thumbnail Generator' });
});

// Thumbnail resize controller
app.post('/thumbnail', createResizeImageJob);
app.get('/thumbnail/:id', getResizeImageJob);

app.listen(port, () => console.log(`Server is listening on port ${port}`));
