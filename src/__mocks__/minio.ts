import fs from 'fs';

// Use disk storage instead of minio for unit tests

export const getObjectMock = jest.fn(async (_, name) =>
  Promise.resolve(fs.createReadStream(`src/test/images_temp/${name}`))
);

export const putObjectMock = jest.fn(
  async (_, name, buffer) =>
    new Promise((resolve) => {
      fs.writeFileSync(`src/test/images_temp/${name}`, buffer);
      resolve(true);
    })
);

const Client = jest.fn().mockImplementation(() => {
  return { getObject: getObjectMock, putObject: putObjectMock };
});

export { Client };
