import http from 'http';
import app from './app';
import config from './utils/config';
import logger from './utils/logger';
import { initializeWebSocket } from './utils/websocket';

const server = http.createServer(app);

initializeWebSocket(server);

server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});
