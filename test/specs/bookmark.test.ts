import fetchMock from 'fetch-mock';
import { Liquid } from 'liquidjs';

import { FeedPath } from '@frenfit-types';
import endpoints from '@sdk/feed/endpoints';
import { setAuthCookies, toggleBookmark } from '@sdk/index';
import { frontendURL } from '@sdk/support/client';
import { UnexpectedResponseException } from '@sdk/support/exceptions';
import { initContext, randomString } from '@test/support/utils';

import { listEntries } from '../../src/feed';

const context = initContext<{
  engine: Liquid;
}>();

beforeAll(() => {
  context.engine = new Liquid();
});

describe('bookmarks', () => {
  afterEach(() => {
    fetchMock.restore();
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

  test('it can list bookmarked entries', async () => {
    const ids = Array.from({ length: 5 }, () => Math.ceil(1000 * Math.random()));

    const response = context.engine.renderFile('./test/fixtures/entries.html', {
      entries: ids.map(id => ({
        id,
        content: randomString(),
        userName: randomString(),
        userFullName: randomString(),
        userId: Math.ceil(1000 * Math.random()),
      })),
      currentPage: 1,
      nextPage: true,
    });

    const feed = FeedPath.bookmarks;
    fetchMock.get(frontendURL(feed).toString(), response);
    for (const entryId of ids) {
      const entryJson = context.engine.renderFile('./test/fixtures/entry.json', {
        entryId,
      });
      fetchMock.get(endpoints.entry(entryId).toString(), entryJson);

      const deleteBookmarkResponse = context.engine.renderFile('./test/fixtures/bookmark.html', {
        entryId,
        bookmarked: true,
      });

      fetchMock.get(endpoints.bookmark(entryId).toString(), deleteBookmarkResponse);

      const bookmarkResponse = context.engine.renderFile('./test/fixtures/bookmark.html', {
        entryId,
        bookmarked: false,
      });
      fetchMock.get(endpoints.bookmark(entryId).toString(), bookmarkResponse, { overwriteRoutes: true });
    }

    const result = await listEntries({
      feed,
    });

    expect(result.entries).toHaveLength(ids.length);
    expect(result.entries.map(e => e.id)).toStrictEqual(ids);
    expect(result.entries.map(e => e.bookmarked)).toStrictEqual(Array.from({ length: ids.length }, () => true));
  });
});
