logger.ts

import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [new transports.Console()]
});

export default logger;
_------_------_------_------_------_------_------_------
correlationId.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const incomingId = req.headers['x-correlation-id'];
  const correlationId = typeof incomingId === 'string' && UUID_PATTERN.test(incomingId)
    ? incomingId
    : uuidv4();

  res.locals.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  next();
}

_------_------_------_------_------_------_------_------

app.ts
import express from 'express';
import { correlationIdMiddleware } from './middleware/correlationId.middleware';

const app = express();
app.use(correlationIdMiddleware);

_------_------_------_------_------_------_------_------

export function extractRespDescription(xml: string): string {
  const match = xml.match(/<respDescription>(.*?)<\/respDescription>/);
  return match ? match[1] : '';
}
------------------
  soapService.ts
  import logger from '../logger';
import { ResponseCodes } from '../responseCodes';
import { extractRespDescription } from '../utils/extractRespDescription';

export async function handleSoap(req, res) {
  const { msisdn } = req.body;
  const correlationId = res.locals.correlationId;

  let mtasResponse;
  try {
    mtasResponse = await sendSoapRequest(...);
    const backendResponse = extractRespDescription(mtasResponse);

    logger.info({
      ...ResponseCodes.MTAS_SUCCESS,
      backend_response: backendResponse,
      correlationId
    });

    return res.status(200).json({
      ...ResponseCodes.MTAS_SUCCESS,
      correlationId
    });
  } catch (err) {
    logger.error({
      ...ResponseCodes.ENUM_FAILED,
      backend_response: extractRespDescription(mtasResponse || ''),
      correlationId
    });

    return res.status(500).json({
      ...ResponseCodes.ENUM_FAILED,
      correlationId
    });
  }
}
------
  logger.error({
  ...ResponseCodes.ENUM_FAILED,
  backend_response: 'ENUM failed for msisdn xxx',
  correlationId: res.locals.correlationId
});
