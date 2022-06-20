import * as minio from 'minio';

const storage = new minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT, 10),
  useSSL: process.env.MINIO_ENDPOINT == 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
});

const BUCKET_NAME = 'thumbnails';

// make sure the bucket exists before starting the server
const initStorage = async (): Promise<boolean> => {
  try {
    const alreadyExists = await storage.bucketExists(BUCKET_NAME);
    if (alreadyExists) {
      return true;
    }
    console.log('Bucket doesnt exist. Creating bucket: ', BUCKET_NAME);
    await storage.makeBucket(BUCKET_NAME, 'ap-northeast-1');
    return true;
  } catch (error) {
    console.error('Storage init failed: ', error);
    return false;
  }
};

// create a file in minio, using a buffer
const putFile = async (fileName: string, buffer: Buffer): Promise<boolean> => {
  try {
    await storage.putObject(BUCKET_NAME, fileName, buffer);
    return true;
  } catch (error) {
    console.error('Store file failed: ', error);
    return false;
  }
};

// converts a stream to a buffer
const streamToBuffer = (stream: NodeJS.ReadableStream): Promise<Buffer> => {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
};

// get a file from minio by name, as a buffer or stream
const getFile = async (
  fileName: string,
  asBuffer = true
): Promise<Buffer | NodeJS.ReadableStream | null> => {
  try {
    const fileStream = await storage.getObject(BUCKET_NAME, fileName);
    if (asBuffer) {
      return await streamToBuffer(fileStream);
    }
    return fileStream;
  } catch (error) {
    console.error('Get file failed: ', error);
    return null;
  }
};

// generate a presigned link for getting a file
const getFileLink = async (filename: string): Promise<string> => {
  return storage.presignedGetObject(BUCKET_NAME, filename);
};

export { initStorage, putFile, getFile, getFileLink };
