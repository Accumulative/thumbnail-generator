import { agenda } from './worker';

if (process.env.SERVER_TYPE === 'worker') {
  (async function () {
    await agenda.start();
  })();
} else {
  require('./server');
}
