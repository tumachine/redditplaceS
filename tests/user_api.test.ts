import { User, IUser } from '../src/models/user';
import init from './db_helper';
import app from '../src/app';
// eslint-disable-next-line import/order
import supertest from 'supertest';

const users = [
  {
    username: 'ikmen',
    password: 'katamaran',
  },
  {
    username: 'aldar',
    password: 'sinkand',
  },
];

const api = supertest(app);

init();

beforeEach(async () => {
  const promiseUserArray = users.map((u) => api.post('/api/users/').send(u));
  await Promise.all(promiseUserArray);
});

test('all users are returned', async () => {
  const response = await api.get('/api/users')
    .expect(200)
    .expect('Content-Type', /application\/json/);

  expect(response.body).toHaveLength(2);
});
