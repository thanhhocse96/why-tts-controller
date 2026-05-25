import { startGateway } from './gateway/src/server.js';

startGateway().catch((error) => {
  console.error('[gateway] fatal startup error');
  console.error(error);
  process.exitCode = 1;
});
