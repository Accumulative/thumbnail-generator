/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDatabase, closeDatabase, getDatabase } from '../../database';
import * as minio from 'minio';
import { resizeImage } from '../../jobs/thumbnail';
import { getFile } from '../../storage';
jest.mock('minio');

// base test steps
const test = async (id: string, filename: string) => {
  const data = {
    _id: id,
    filename: `${id}.png`,
    status: 'waiting',
    thumbnailFilename: '',
    originalFilename: filename
  };
  await getDatabase().collection('thumbnailJob').insertOne(data);

  await resizeImage({ attrs: { data } });
  expect((minio as any).getObjectMock).toBeCalledTimes(1);

  const output = await getDatabase()
    .collection('thumbnailJob')
    .findOne({ _id: data._id });

  return [data, output];
};

// what to expect when processing is successful
const goodExpectations = async (record: any, data: any) => {
  expect((minio as any).putObjectMock).toBeCalledTimes(1);
  expect(record).toHaveProperty('filename', data.filename);
  expect(record).toHaveProperty('_id', data._id);
  expect(record).toHaveProperty('originalFilename', data.originalFilename);
  expect(record).toHaveProperty('status', 'complete');
  expect(record).toHaveProperty('thumbnailFilename', `100px_${data.filename}`);
  console.log(`100px_${data.filename}`);

  // result thumbnail will exist in s3
  const file = await getFile(`100px_${data.filename}`);
  expect(file).not.toBeNull();
};

// what to expect when processing is unsuccessful
const badExpectations = async (record: any, data: any) => {
  expect(record).toHaveProperty('filename', data.filename);
  expect(record).toHaveProperty('_id', data._id);
  expect(record).toHaveProperty('originalFilename', data.originalFilename);
  expect(record).toHaveProperty('status', 'failed');
  expect(record).toHaveProperty('thumbnailFilename', '');

  // result thumbnail wont exist in s3
  const file = await getFile(`100px_${data.filename}`);
  expect(file).toBeNull();
};

describe('Thumbnail jobs', () => {
  beforeAll((done) => {
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

  beforeEach((done) => {
    jest.clearAllMocks();
    done();
  });

  it('Resizing 400x400 image will succeed', async () => {
    const [input, output] = await test(
      'good_image_400x400',
      'good_image_400x400.png'
    );
    await goodExpectations(output, input);
  });

  it('Resizing 50x50 image will succeed', async () => {
    const [input, output] = await test(
      'good_image_50x50',
      'good_image_50x50.png'
    );
    await goodExpectations(output, input);
  });

  it('Resizing pdf with fail', async () => {
    const [input, output] = await test(
      'bad_image_actually_pdf',
      'bad_image_actually_pdf.png'
    );
    await badExpectations(output, input);
  });

  it('Resizing when image doesnt exist fails', async () => {
    const [input, output] = await test('doesnt_exist', 'doesnt_exist.png');
    await badExpectations(output, input);
  });
});
