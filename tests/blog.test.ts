import * as listHelper from '../src/utils/list_helper';
import * as helper from './test_helper';

// beforeEach(() => {});

test('dummy returns one', () => {
  const result = listHelper.dummy([]);
  expect(result).toBe(1);
});

describe('total likes', () => {
  test('of 6 blogs is 36', () => {
    const result = listHelper.totalLikes(helper.initialBlogs);
    expect(result).toBe(36);
  });
});

describe('most liked blog', () => {
  const mostLiked = helper.initialBlogs[2];
  test(`of 6 blogs is '${mostLiked.title}' by ${mostLiked.author}`, () => {
    const result = listHelper.favoriteBlog(helper.initialBlogs);

    expect(result).toEqual(mostLiked);
  });
});

describe('most blogs', () => {
  const mostBlogs: listHelper.IMostBlogs = { author: helper.initialBlogs[3].author, blogs: 3 };
  test(`of 6 blogs is ${mostBlogs.author} with ${mostBlogs.blogs} blogs`, () => {
    const result = listHelper.mostBlogs(helper.initialBlogs);
    expect(result).toEqual(mostBlogs);
  });
});

describe('most likes on author', () => {
  const mostLikes: listHelper.IMostLikes = { author: helper.initialBlogs[2].author, likes: 17 };
  test(`of 6 blogs is ${mostLikes.author} with ${mostLikes.likes} likes`, () => {
    const result = listHelper.mostLikes(helper.initialBlogs);
    expect(result).toEqual(mostLikes);
  });
});
