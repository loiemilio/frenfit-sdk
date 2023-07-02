import fetchMock from 'fetch-mock';
import { Liquid } from 'liquidjs';

import endpoints from '@sdk/feed/endpoints';
import { setAuthCookies } from '@sdk/index';
import { UnexpectedResponseException } from '@sdk/support/exceptions';
import { initContext, randomString } from '@test/support/utils';

import { hideEntry, unhideEntry } from '../../src/feed';

const context = initContext<{
  engine: Liquid;
}>();

beforeAll(() => {
  context.engine = new Liquid();
});

describe('feed reactions', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  beforeEach(() => {
    setAuthCookies(randomString(), randomString());
  });

  test('it can hide an entry', async () => {
    const entryId = Math.ceil(Math.random() * 1000);

    const hideResponse = (await context.engine.renderFile('./test/fixtures/hideEntry.html', { entryId })) as string;

    fetchMock.post(endpoints.hideEntry.toString(), hideResponse);

    const result = await hideEntry(entryId);
    expect(result).toEqual(true);
  });

  test('it throws UnexpectedResponseException if invalid response received when un-hiding an entry', async () => {
    const entryId = Math.ceil(Math.random() * 1000);
    fetchMock.get(endpoints.unhideEntry(entryId).toString(), '<invalid response>');

    const action = async () => await unhideEntry(entryId);
    await expect(action).rejects.toThrow(UnexpectedResponseException);
  });

  test('it can un-hide an entry', async () => {
    const entryId = Math.ceil(Math.random() * 1000);

    const unhideResponse = (await context.engine.renderFile('./test/fixtures/unhideEntry.html', { entryId })) as string;
    const entryResponse = (await context.engine.renderFile('./test/fixtures/entry.json', { entryId })) as string;
    const bookmarkResponse = (await context.engine.renderFile('./test/fixtures/bookmark.html', {
      entryId,
      bookmarked: true,
    })) as string;
    const bookmarkResponse2 = (await context.engine.renderFile('./test/fixtures/bookmark.html', {
      entryId,
      bookmarked: false,
    })) as string;

    fetchMock
      .get(endpoints.unhideEntry(entryId).toString(), unhideResponse)
      .get(endpoints.entry(entryId).toString(), entryResponse)
      .get(endpoints.bookmark(entryId).toString(), bookmarkResponse)
      .get(endpoints.bookmark(entryId).toString(), bookmarkResponse2, { overwriteRoutes: false });

    const entry = await unhideEntry(entryId);
    expect(entry.isHidden).toEqual(false);
  });
});
