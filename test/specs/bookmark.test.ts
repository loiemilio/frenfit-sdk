import fetchMock from 'fetch-mock';
import { Liquid } from 'liquidjs';

import endpoints from '@sdk/feed/endpoints';
import { setAuthCookies, toggleBookmark } from '@sdk/index';
import { UnexpectedResponseException } from '@sdk/support/exceptions';
import { initContext, randomString } from '@test/support/utils';

const context = initContext<{
  engine: Liquid;
}>();

afterEach(() => {
  fetchMock.restore();
});

beforeAll(() => {
  context.engine = new Liquid();
});

beforeEach(() => {
  setAuthCookies(randomString(), randomString());
});

test('it throws UnexpectedResponseException when failing to bookmark an entry', async () => {
  const entryId = Math.ceil(1000 * Math.random());

  fetchMock.get(endpoints.bookmark(entryId).toString(), '<invalid response>');

  const action = async () => await toggleBookmark(entryId);

  await expect(action).rejects.toThrow(UnexpectedResponseException);
});

test('it can bookmark an entry', async () => {
  const entryId = Math.ceil(1000 * Math.random());
  const response = (await context.engine.renderFile('./test/fixtures/bookmark.html', {
    entryId,
    bookmarked: false,
  })) as string;

  fetchMock.get(endpoints.bookmark(entryId).toString(), response);

  const result = await toggleBookmark(entryId);
  expect(result).toEqual(true);
});

test('it can delete a bookmark', async () => {
  const entryId = Math.ceil(1000 * Math.random());
  const response = (await context.engine.renderFile('./test/fixtures/bookmark.html', {
    entryId,
    bookmarked: true,
  })) as string;

  fetchMock.get(endpoints.bookmark(entryId).toString(), response);

  const result = await toggleBookmark(entryId);
  expect(result).toEqual(false);
});
