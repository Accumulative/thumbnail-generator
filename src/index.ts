import { agenda } from './worker';
import { connectDatabase } from './database';

connectDatabase((error) => {
  if (error) {
    console.log('Shutting down server - database error');
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
