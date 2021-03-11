import { agenda } from './worker';
import { initStorage } from './storage';
import { connectDatabase } from './database';

connectDatabase((error) => {
  if (error) {
    console.log('Shutting down server - database error');
  } else {
    initStorage().then((result) => {
      if (!result) {
        console.log('Shutting down server - storage error');
      } else {
        if (process.env.SERVER_TYPE === 'worker') {
          (async function () {
            await agenda.start();
          })();
        } else {
          require('./server');
        }
      }
    });
  }
});
