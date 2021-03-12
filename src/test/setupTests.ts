import fs from 'fs/promises';

// This basically clears out the src/test/images_temp library and populates it with the default state (the src/test/images folder)

global.beforeAll(async (done) => {
  const fileNamesTemp = await fs.readdir('./src/test/images_temp');
  for (const name of fileNamesTemp) {
    if (name != '.gitignore') {
      await fs.unlink(`./src/test/images_temp/${name}`);
    }
  }
  const fileNames = await fs.readdir('./src/test/images');
  for (const name of fileNames) {
    await fs.copyFile(
      `./src/test/images/${name}`,
      `./src/test/images_temp/${name}`
    );
  }
  console.log('Folder setup complete');
  done();
});
