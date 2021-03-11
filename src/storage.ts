import * as minio from 'minio';

const storage = new minio.Client({
  endPoint: 's3',
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
});

const BUCKET_NAME = 'thumbnails';

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

const putFile = async (fileName: string, buffer: Buffer): Promise<boolean> => {
  try {
    await storage.putObject(BUCKET_NAME, fileName, buffer);
    return true;
  } catch (error) {
    console.error('Store file failed: ', error);
    return false;
  }
};

const getFile = async (
  fileName: string
): Promise<NodeJS.ReadableStream | null> => {
  try {
    return await storage.getObject(BUCKET_NAME, fileName);
  } catch (error) {
    console.error('Get file failed: ', error);
    return null;
  }
};

export { initStorage, putFile, getFile };
