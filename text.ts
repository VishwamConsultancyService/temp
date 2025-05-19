logger.ts

import { createLogger, format, transports } from 'winston';
import ecsFormat from '@elastic/ecs-winston-format';

const logger = createLogger({
  level: 'info',
  format: ecsFormat({ convertReqRes: true }),
  transports: [
    new transports.Console()
  ]
});

export default logger;

ecsLogger.middleware.ts

// src/middleware/ecsLogger.middleware.ts
import morgan from 'morgan';
import ecsFormat from '@elastic/ecs-morgan-format';
import logger from '../logger';

const ecsMorgan = morgan(ecsFormat(), {
  stream: {
    write: (message) => logger.info(message.trim())
  }
});

export default ecsMorgan;


import express from 'express';
import ecsMorgan from './middleware/ecsLogger.middleware';

const app = express();

app.use(ecsMorgan);
