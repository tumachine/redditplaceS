import supertest from 'supertest';
import { Pixel, IPixel } from '../src/models/pixel';
import * as helper from './test_helper';
import app from '../src/app';
import init from './db_helper';

const api = supertest(app);

init();

beforeEach(async () => {
  const blogs = helper.initialBlogs.map((blog) => new Blog(blog));
  const promiseBlogsArray = blogs.map((blog) => blog.save());
  await Promise.all(promiseBlogsArray);
});

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);

  expect(response.body)
    .toHaveLength(helper.initialBlogs.length);
});

test('id property exists on blog', async () => {
  const blogs = await helper.blogsInDb();
  expect(blogs[0].id).toBeDefined();
});

test('blog is added to DB', async () => {
  const newBlog: IBlog = {
    title: 'Test addition',
    author: 'Addition',
    url: 'https://testaddition.com',
    likes: 10259,
  };

  await api.post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const blogsInDb = await helper.blogsInDb();
  expect(blogsInDb).toHaveLength(helper.initialBlogs.length + 1);

  const urls = blogsInDb.map((b) => b.url);
  expect(urls).toContain(newBlog.url);
});

test('blog without property likes, defaults likes to 0', async () => {
  const newBlog = {
    title: 'Test likes',
    author: 'Likes',
    url: 'https://testlikes.com',
  };

  const result = await api.post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  expect(result.body.likes)
    .toBeDefined();

  expect(result.body.likes)
    .toEqual(0);
});

test('blog missing title and url properties', async () => {
  const newBlog = {
    author: 'Missing properties',
    likes: 10,
  };

  await api.post('/api/blogs')
    .send(newBlog)
    .expect(400);
});

test('blog delete', async () => {
  const blogsAtStart = await helper.blogsInDb();
  const blogToDelete = blogsAtStart[0];

  await api.delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204);

  const blogsAtEnd = await helper.blogsInDb();

  expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1);

  const urls = blogsAtEnd.map((b) => b.url);
  expect(urls).not.toContain(blogToDelete.url);
});

test('blog update', async () => {
  // length should not change
  // item with id should update any value
  const blogsAtStart = await helper.blogsInDb();
  const blogToUpdate = blogsAtStart[0];

  const likesBeforeUpdate = blogToUpdate.likes;

  blogToUpdate.likes += 2;

  const updatedBlog = await api.put(`/api/blogs/${blogToUpdate.id}`).send(blogToUpdate)
    .expect(200);

  expect(updatedBlog.body.likes).toEqual(likesBeforeUpdate + 2);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(blogsAtStart.length);
});
