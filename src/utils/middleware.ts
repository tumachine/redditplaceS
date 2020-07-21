import morgan from 'morgan';
import { Request, Response, NextFunction } from 'express';
import logger from './logger';

morgan.token('body', (request: Request) => JSON.stringify(request.body));

const requestLogger = morgan(':method :url :status :res[content-length] - :response-time ms :body');

const unknownEndpoint = (request: Request, response: Response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

// eslint-disable-next-line consistent-return
const errorHandler = (error: Error, request: Request, response: Response, next: NextFunction) => {
  logger.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

const middleware = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
};

export default middleware;
