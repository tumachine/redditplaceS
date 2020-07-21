import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import config from '../src/utils/config';

class TestDbHelper {
  server: MongoMemoryServer;

  constructor() {
    this.server = new MongoMemoryServer();
  }

  async connect() {
    const uri = await this.server.getConnectionString();
    console.log(uri);
    await mongoose.connect(uri, config.mongooseOptions);
  }

  async stop() {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await this.server.stop();
  }

  // eslint-disable-next-line class-methods-use-this
  async cleanup() {
    // eslint-disable-next-line prefer-destructuring
    const collections = mongoose.connection.collections;
    const collectionNames = Object.keys(collections);
    const collectionsPromises = collectionNames.map((collectionKey) => {
      const collection = collections[collectionKey];
      return collection.deleteMany({});
    });

    await Promise.all(collectionsPromises);
  }
}

const db = new TestDbHelper();

const init = async () => {
  beforeAll(async () => {
    await db.connect();
  });

  afterEach(async () => {
    await db.cleanup();
  });

  afterAll(async () => {
    await db.stop();
  });
};

export default init;
