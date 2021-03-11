/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import thumbnailRoutes from '../../routes/thumbnail';
import request from 'supertest';
import { connectDatabase, closeDatabase, getDatabase } from '../../database';
import { agenda } from '../../worker';
import * as minio from 'minio';
jest.mock('minio');

const app = express();
app.use(express.json({ limit: '20mb' }));

app.use('/thumbnail', thumbnailRoutes);

const goodTest = async (name: string) => {
  const { body } = await request(app)
    .post('/thumbnail')
    .set('Content-Type', 'multipart/form-data')
    .attach('file', `src/test/images/${name}`)
    .expect(200);

  expect(body).toHaveProperty('data');
  expect(body.data).toHaveProperty('job_id');
  const jobId = body.data.job_id;

  expect((minio as any).putObjectMock).toHaveBeenCalledTimes(1); // called when putting original image into s3 by controller
  expect((minio as any).getObjectMock).not.toHaveBeenCalled();
  expect(agenda.now).toHaveBeenCalledTimes(1); // job is scheduled

  // check data passed to job
  const data = agenda.now.mock.calls[0][1];
  expect(data).toHaveProperty('filename');
  expect(data).toHaveProperty('_id');
  expect(data).toHaveProperty('originalFilename', name);
  expect(data).toHaveProperty('status', 'waiting');
  expect(data).toHaveProperty('thumbnailFilename', '');

  const record = await getDatabase()
    .collection('thumbnailJob')
    .findOne({ _id: data._id });

  expect(record).toEqual(data);
  expect(record._id).toEqual(jobId);
};

describe('Thumbnail routes', () => {
  beforeAll((done) => {
    // mock agenda to process instantly rather than using set timeout in tests
    agenda.now = jest.fn();
    connectDatabase(async () => {
      await getDatabase().collection('thumbnailJob').deleteMany({});
      done();
    });
  });

  afterAll((done) => {
    closeDatabase(() => {
      done();
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /thumbnail - success', async () => {
    request(app).get('/thumbnail').expect(200);
  });

  it('POST /thumbnail - no image', async () => {
    request(app).post('/thumbnail').expect(400);
  });

  it('POST /thumbnail 400x400 - success', async () => {
    await goodTest('good_image_400x400.png');
  });

  it('POST /thumbnail 50x50 - success', async () => {
    await goodTest('good_image_50x50.png');
  });

  it('POST /thumbnail secretly a pdf - success', async () => {
    // with the current implementation, this will pass initial validation, but fail during the resize job
    await goodTest('bad_image_actually_pdf.png');
  });

  it('POST /thumbnail obviously a pdf - success', async () => {
    const { body } = await request(app)
      .post('/thumbnail')
      .set('Content-Type', 'multipart/form-data')
      .attach('file', `src/test/images/not_an_image.pdf`)
      .expect(400);

    expect(body).toHaveProperty('error');
    expect(body.error).toEqual('Please supply an image');
  });
});
