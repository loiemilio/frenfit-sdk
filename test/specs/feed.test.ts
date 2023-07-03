import fetchMock from 'fetch-mock';
import { Liquid } from 'liquidjs';

import { FeedPath } from '@frenfit-types';
import { setAuthCookies } from '@sdk/auth';
import { listEntries, listEntryIds } from '@sdk/feed';
import { frontendURL } from '@sdk/support/client';
import { initContext, randomString } from '@test/support/utils';

const context = initContext<{
  engine: Liquid;
}>();

beforeAll(() => {
  context.engine = new Liquid();
});

describe('feeds', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  beforeEach(() => {
    setAuthCookies(randomString(), randomString());
  });

  test('it can get entry ids from feed page', async () => {
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

    const url = frontendURL(FeedPath.bookmarks);
    fetchMock.get(url.toString(), response);

    const result = await listEntryIds(frontendURL(FeedPath.bookmarks));
    expect(result.ids).toStrictEqual(ids);
    expect(result.nextPage).toEqual(true);
  });

  test('it can ask for a specific feed page', async () => {
    const page = 2;
    const feedPage = context.engine.renderFile('./test/fixtures/entries.html', {
      currentPage: page,
      nextPage: true,
    });

    fetchMock.get('*', feedPage);
    const response = await listEntries({
      feed: FeedPath.home,
      page,
    });

    const calls = fetchMock.calls();
    expect(calls).toHaveLength(1);
    const url = new URL(calls[0][0]);
    expect(url.searchParams.get('page')).toEqual(`${page}`);

    expect(response.entries).toHaveLength(0);
  });
});
