logSanitizer.ts

// src/utils/logSanitizer.ts

import { Request } from 'express';

const MASK = '****';
const FIELDS_TO_MASK = ['authorization', 'auth', 'token', 'password', 'cardNumber', 'cvv'];
const PARTIAL_FIELDS = ['cardNumber', 'creditCard', 'cc'];

function maskValue(value: any, keepLast = 4): string {
  if (typeof value === 'string' && value.length > keepLast) {
    const visible = value.slice(-keepLast);
    return `${'*'.repeat(value.length - keepLast)}${visible}`;
  }
  return MASK;
}

function recursivelyMask(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;

  const masked: any = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    const lowerKey = key.toLowerCase();

    if (FIELDS_TO_MASK.includes(lowerKey)) {
      masked[key] = maskValue(obj[key]);
    } else if (PARTIAL_FIELDS.includes(lowerKey)) {
      masked[key] = maskValue(obj[key], 4);
    } else if (typeof obj[key] === 'object') {
      masked[key] = recursivelyMask(obj[key]);
    } else {
      masked[key] = obj[key];
    }
  }

  return masked;
}

export function sanitizeRequest(req: Request) {
  return {
    method: req.method,
    url: req.originalUrl,
    headers: recursivelyMask(req.headers),
    query: recursivelyMask(req.query),
    body: recursivelyMask(req.body),
  };
}
----

  // src/middleware/ecslogger.ts

import morgan from 'morgan';
import ecsFormat from '@elastic/ecs-morgan-format';
import logger from '../logger';
import { sanitizeRequest } from '../utils/logSanitizer';

const ecsMorgan = morgan(ecsFormat(), {
  stream: {
    write: (message, req?: any) => {
      const sanitized = sanitizeRequest(req); // ensure sensitive data is masked
      logger.info({ message: message.trim(), request: sanitized });
    }
  }
});

export default ecsMorgan;
