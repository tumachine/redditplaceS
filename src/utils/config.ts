/* eslint-disable prefer-destructuring */
import env from 'dotenv';
import mongoose from 'mongoose';

// load env variables
env.config();

declare const process : {
  env: {
    [key: string]: string
  }
};

const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

const mongooseOptions: mongoose.ConnectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
};

const config = {
  PORT,
  MONGODB_URI,
  mongooseOptions,
};

export default config;
