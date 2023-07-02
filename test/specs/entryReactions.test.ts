import fetchMock from 'fetch-mock';
import { Liquid } from 'liquidjs';

import { MyPreference } from '@frenfit-types';
import { setAuthCookies } from '@sdk/auth';
import { toggleEntryDislike, toggleEntryLike } from '@sdk/feed';
import endpoints from '@sdk/feed/endpoints';
import { initContext, randomString } from '@test/support/utils';

const context = initContext<{
  engine: Liquid;
}>();

beforeAll(() => {
  context.engine = new Liquid();
});

describe('entry reactions', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  beforeEach(() => {
    setAuthCookies(randomString(), randomString());
  });

  it('can dislike an entry', async () => {
    const [id, dislikes, likes] = [
      Math.ceil(Math.random() * 1000),
      Math.ceil(Math.random() * 10),
      Math.ceil(Math.random() * 10),
    ];

    const dislikeResponse = context.engine.renderFile('./test/fixtures/entryReaction.html', {
      id,
      disliked: true,
      likes,
      dislikes,
    });

    fetchMock.get(endpoints.dislikeEntry(id).toString(), dislikeResponse, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    const preferences = await toggleEntryDislike(id);
    expect(preferences.dislikes).toStrictEqual(dislikes);
    expect(preferences.likes).toStrictEqual(likes);
    expect(preferences.myPreference).toStrictEqual(MyPreference.dislike);
  });

  it('can like an entry', async () => {
    const [id, dislikes, likes] = [
      Math.ceil(Math.random() * 1000),
      Math.ceil(Math.random() * 10),
      Math.ceil(Math.random() * 10),
    ];

    const likeResponse = context.engine.renderFile('./test/fixtures/entryReaction.html', {
      id,
      liked: true,
      likes,
      dislikes,
    });

    fetchMock.get(endpoints.likeEntry(id).toString(), likeResponse, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    const preferences = await toggleEntryLike(id);
    expect(preferences.dislikes).toStrictEqual(dislikes);
    expect(preferences.likes).toStrictEqual(likes);
    expect(preferences.myPreference).toStrictEqual(MyPreference.like);
  });
});
