import pino from 'pino';
import { AsyncLocalStorage } from 'async_hooks';

export const loggerStorage = new AsyncLocalStorage<{ requestId?: string }>();

const pinoLogger = pino({
  level: process.env['LOG_LEVEL'] || 'info',
  transport: process.env['NODE_ENV'] === 'development'
    ? { target: 'pino-pretty' }
    : undefined,
  base: {
    service: 'jaktra-backend',
    environment: process.env['NODE_ENV'],
  },
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
  }
});

type LogArg = string | Record<string, unknown> | Error | object;

function getMetadata(obj?: Record<string, unknown> | object): Record<string, unknown> {
  const store = loggerStorage.getStore();
  const requestId = store?.requestId;
  
  if (!requestId) return (obj as Record<string, unknown>) || {};
  if (!obj) return { requestId };
  return { requestId, ...(obj as Record<string, unknown>) };
}

export const logger = {
  info: (arg1: LogArg, ...args: unknown[]): void => {
    if (typeof arg1 === 'string') {
      pinoLogger.info(getMetadata(), arg1, ...args);
    } else {
      pinoLogger.info(getMetadata(arg1 as Record<string, unknown>), ...(args as [string?, ...unknown[]]));
    }
  },
  warn: (arg1: LogArg, ...args: unknown[]): void => {
    if (typeof arg1 === 'string') {
      pinoLogger.warn(getMetadata(), arg1, ...args);
    } else {
      pinoLogger.warn(getMetadata(arg1 as Record<string, unknown>), ...(args as [string?, ...unknown[]]));
    }
  },
  error: (arg1: LogArg, ...args: unknown[]): void => {
    if (typeof arg1 === 'string') {
      const errorObj = args[0];
      if (errorObj instanceof Error) {
        pinoLogger.error(getMetadata({ err: errorObj }), arg1, ...args.slice(1));
      } else if (errorObj && typeof errorObj === 'object') {
        pinoLogger.error(getMetadata(errorObj as Record<string, unknown>), arg1, ...args.slice(1));
      } else {
        pinoLogger.error(getMetadata(), arg1, ...args);
      }
    } else {
      pinoLogger.error(getMetadata(arg1 as Record<string, unknown>), ...(args as [string?, ...unknown[]]));
    }
  },
  debug: (arg1: LogArg, ...args: unknown[]): void => {
    if (typeof arg1 === 'string') {
      pinoLogger.debug(getMetadata(), arg1, ...args);
    } else {
      pinoLogger.debug(getMetadata(arg1 as Record<string, unknown>), ...(args as [string?, ...unknown[]]));
    }
  },
  child: (bindings: Record<string, unknown>) => pinoLogger.child(bindings),
};
