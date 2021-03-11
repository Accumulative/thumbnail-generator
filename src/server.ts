import express from 'express';
import { Application, Request, Response } from 'express';
import thumbnailRoutes from './routes/thumbnail';

const app: Application = express();
app.use(express.json({ limit: '20mb' }));

const port = 3000;

app.get('/', (_: Request, res: Response) => {
  res.status(200).send({ data: 'Hello from Thumbnail Generator' });
});

// Thumbnail controller
app.use('/thumbnail', thumbnailRoutes);

app.listen(port, () => console.log(`Server is listening on port ${port}`));
