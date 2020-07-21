import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import config from './utils/config';
import logger from './utils/logger';
import middleware from './utils/middleware';
import usersRouter from './controllers/users';
import placeRouter from './controllers/places';

const app = express();

const connect = async () => {
  try {
    console.log(config.MONGODB_URI);
    await mongoose.connect(config.MONGODB_URI, config.mongooseOptions);
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('error connection to MongoDB:', error.message);
  }
};

if (process.env.NODE_ENV !== 'test') {
  connect();
}

app.use(cors());
app.use(express.static('build'));
app.use(express.json());
app.use(middleware.requestLogger);

app.use('/api/users', usersRouter);
app.use('/api/places', placeRouter);

app.use(express.static('static'));

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

export default app;
