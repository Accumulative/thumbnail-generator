import fs from 'fs';

// This basically clears out the src/test/images_temp library and populates it with the default state (the src/test/images folder)

global.beforeAll(() => {
  fs.readdir('./src/test/images_temp', (err, fileNames) => {
    if (err) throw err;
    for (const name of fileNames) {
      if (name != '.gitignore') {
        fs.unlink(`./src/test/images_temp/${name}`, (err) => {
          if (err) throw err;
        });
      }
    }
  });
  fs.readdir('./src/test/images', (err, fileNames) => {
    if (err) throw err;
    for (const name of fileNames) {
      fs.copyFile(
        `./src/test/images/${name}`,
        `./src/test/images_temp/${name}`,
        (err) => {
          if (err) throw err;
        }
      );
    }
  });
});
