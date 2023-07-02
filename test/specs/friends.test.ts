import { decodeHTML } from 'entities';
import fetchMock from 'fetch-mock';
import { Liquid } from 'liquidjs';

import { setAuthCookies } from '@sdk/auth';
import feedEndpoints from '@sdk/feed/endpoints';
import {
  follow,
  getFriend,
  getHovercard,
  listBlocked,
  listFollowerRequests,
  listFollowers,
  listFollowing,
  listFollowingRequests,
  unfollow,
} from '@sdk/friend';
import endpoints from '@sdk/friend/endpoints';
import { UnexpectedResponseException } from '@sdk/support/exceptions';
import { initContext, randomString } from '@test/support/utils';

const context = initContext<{
  engine: Liquid;
}>();

const mockFriend = (commands?: ('unfollow' | 'follow' | 'block' | 'unblock')[]) => ({
  id: Math.ceil(Math.random() * 1000),
  username: randomString(),
  fullName: randomString(),
  description: randomString(),
  locked: Math.random() < 0.5,
  type: 'User',
  avatarUrl: randomString(),
  email: randomString(),
  commands: commands ?? [Math.random() < 0.5 ? 'unfollow' : 'follow', Math.random() < 0.5 ? 'block' : 'unblock'],
});

beforeAll(() => {
  context.engine = new Liquid();
});

describe('friends', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  beforeEach(() => {
    setAuthCookies(randomString(), randomString());
  });

  it(`can read friend's hovercard`, async () => {
    const id = Math.ceil(Math.random() * 1000);
    const mock = {
      action: Math.random() < 0.5 ? 'follow' : 'unfollow',
      avatar: randomString(),
      bio: randomString(),
      fullname: randomString(),
      name: randomString(),
    };
    const hovercardResponse = context.engine.renderFile('./test/fixtures/hovercard.json', mock);

    fetchMock.get(endpoints.hovercard(id).toString(), hovercardResponse);

    const hovercard = await getHovercard(id);
    expect(hovercard.action).toStrictEqual(mock.action);
    expect(hovercard.image).toStrictEqual(mock.avatar);
    expect(hovercard.bio).toStrictEqual(mock.bio);
    expect(hovercard.name).toStrictEqual(mock.fullname);
    expect(hovercard.username).toStrictEqual(mock.name);
  });

  it(`can get friend's details`, async () => {
    const id = Math.ceil(Math.random() * 1000);
    const mock = {
      action: Math.random() < 0.5 ? 'follow' : 'unfollow',
      avatar: randomString(),
      bio: randomString(),
      fullname: randomString(),
      name: randomString(),
    };
    const hovercardResponse = context.engine.renderFile('./test/fixtures/hovercard.json', mock);

    fetchMock.get(endpoints.hovercard(id).toString(), hovercardResponse);

    const friend = await getFriend(id);
    expect(friend.id).toStrictEqual(id);
    expect(friend.following).toStrictEqual(mock.action === 'unfollow');
    expect(friend.avatarUrl).toStrictEqual(mock.avatar);
    expect(friend.fullName).toStrictEqual(mock.fullname);
    expect(friend.username).toStrictEqual(mock.name);
  });

  it(`can decode html entities in friend's hovercard`, async () => {
    const id = Math.ceil(Math.random() * 1000);
    const mock = {
      action: Math.random() < 0.5 ? 'follow' : 'unfollow',
      avatar: randomString(),
      bio: `${randomString()}&egrave;`,
      fullname: randomString(),
      name: randomString(),
    };
    const hovercardResponse = context.engine.renderFile('./test/fixtures/hovercard.json', mock);

    fetchMock.get(endpoints.hovercard(id).toString(), hovercardResponse);

    const { bio } = await getHovercard(id);
    expect(bio).toStrictEqual(decodeHTML(mock.bio));
  });

  it('can list followers', async () => {
    const friends = Array.from({ length: Math.ceil(Math.random() * 10) }, () => mockFriend());
    const mock = context.engine.renderFile('./test/fixtures/usersList.json', {
      user: mockFriend(),
      friends,
    });

    fetchMock.get(endpoints.followers.toString(), mock);

    const followers = await listFollowers();
    expect(followers.map(u => u.id)).toEqual(friends.map(f => f.id));
    expect(followers).toEqual(friends);
  });

  it('can list follower requests', async () => {
    const followers = Array.from({ length: Math.ceil(Math.random() * 10) }, () => ({
      id: Math.ceil(Math.random() * 1000),
    }));
    const ignoredFollowers = Array.from({ length: Math.ceil(Math.random() * 10) }, () => ({
      id: Math.ceil(Math.random() * 1000),
    }));

    const mock = context.engine.renderFile('./test/fixtures/followerRequests.html', {
      followers,
      ignoredFollowers,
    });

    fetchMock.get(endpoints.followerRequests.toString(), mock);

    const followerMocks = followers.map(() => ({
      action: Math.random() < 0.5 ? 'follow' : 'unfollow',
      avatar: randomString(),
      bio: randomString(),
      fullname: randomString(),
      name: randomString(),
    }));

    followers.forEach(({ id }, i) => {
      const hovercardResponse = context.engine.renderFile('./test/fixtures/hovercard.json', followerMocks[i]);
      fetchMock.get(endpoints.hovercard(id).toString(), hovercardResponse, { overwriteRoutes: true });
    });

    const ignoredFollowerMocks = ignoredFollowers.map(() => ({
      action: Math.random() < 0.5 ? 'follow' : 'unfollow',
      avatar: randomString(),
      bio: randomString(),
      fullname: randomString(),
      name: randomString(),
    }));

    ignoredFollowers.forEach(({ id }, i) => {
      const hovercardResponse = context.engine.renderFile('./test/fixtures/hovercard.json', ignoredFollowerMocks[i]);
      fetchMock.get(endpoints.hovercard(id).toString(), hovercardResponse, { overwriteRoutes: true });
    });

    const { ignoredRequests, newRequests } = await listFollowerRequests();

    expect(ignoredRequests).toEqual(
      ignoredFollowerMocks.map((mock, i) => ({
        id: ignoredFollowers[i].id,
        following: mock.action === 'unfollow',
        avatarUrl: mock.avatar,
        fullName: mock.fullname,
        username: mock.name,
      })),
    );

    expect(newRequests).toEqual(
      followerMocks.map((mock, i) => ({
        id: followers[i].id,
        following: mock.action === 'unfollow',
        avatarUrl: mock.avatar,
        fullName: mock.fullname,
        username: mock.name,
      })),
    );
  });

  it('can list following requests', async () => {
    const friends = Array.from({ length: Math.ceil(Math.random() * 10) }, () => mockFriend());
    const mock = context.engine.renderFile('./test/fixtures/usersList.json', {
      user: mockFriend(),
      friends,
    });

    fetchMock.get(endpoints.followingRequests.toString(), mock);

    const followers = await listFollowingRequests();
    expect(followers.map(u => u.id)).toEqual(friends.map(f => f.id));
    expect(followers).toEqual(friends);
  });

  it('can list followed friends', async () => {
    const friends = Array.from({ length: Math.ceil(Math.random() * 10) }, () => mockFriend());
    const mock = context.engine.renderFile('./test/fixtures/usersList.json', {
      user: mockFriend(),
      friends,
    });

    fetchMock.get(endpoints.following.toString(), mock);

    const following = await listFollowing();
    expect(following.map(u => u.id)).toEqual(friends.map(f => f.id));
    expect(following).toEqual(friends);
  });

  it('can list blocked friends', async () => {
    const friends = Array.from({ length: Math.ceil(Math.random() * 3) }, () => mockFriend(['unblock']));
    const mock = context.engine.renderFile('./test/fixtures/usersList.json', {
      user: mockFriend(),
      friends,
    });

    fetchMock.get(endpoints.blockedUsers.toString(), mock);
    const blocked = await listBlocked();
    expect(blocked.map(u => u.id)).toEqual(friends.map(f => f.id));
    expect(blocked).toEqual(friends);
  });

  it('can not list blockers from invalid page', async () => {
    const feedPage = context.engine.renderFile('./test/fixtures/entries.html', {
      id: 1000,
      blockedIdList: 'undefined',
    });

    fetchMock.get(feedEndpoints.emptyRoom.toString(), feedPage);

    const action = async () => {
      await listBlocked(true);
    };

    await expect(action).rejects.toThrow(UnexpectedResponseException);
  });

  it('can list blockers', async () => {
    const ids = Array.from({ length: Math.ceil(Math.random() * 3) }, () => Math.ceil(Math.random() * 1000));
    const feedPage = context.engine.renderFile('./test/fixtures/entries.html', {
      id: 1000,
      blockedIdList: JSON.stringify(ids),
    });

    fetchMock.get(feedEndpoints.emptyRoom.toString(), feedPage);

    const mocks = ids.map(() => ({
      action: Math.random() < 0.5 ? 'follow' : 'unfollow',
      avatar: randomString(),
      bio: randomString(),
      fullname: randomString(),
      name: randomString(),
    }));

    ids.forEach((id, i) => {
      const hovercardResponse = context.engine.renderFile('./test/fixtures/hovercard.json', mocks[i]);
      fetchMock.get(endpoints.hovercard(id).toString(), hovercardResponse, { overwriteRoutes: true });
    });

    const blocked = await listBlocked(true);
    expect(blocked).toEqual(
      mocks.map((mock, i) => ({
        id: ids[i],
        following: mock.action === 'unfollow',
        avatarUrl: mock.avatar,
        fullName: mock.fullname,
        username: mock.name,
      })),
    );
  });

  it('can follow a friend', async () => {
    const id = Math.ceil(Math.random() * 1000);
    fetchMock.get(
      endpoints.follow(id).toString(),
      `<a href="#" class="btn btn-danger unfollow "  data-uid="${id}">Unfollow</a>
      <span class="loading hide"><img src="/earlyadopters/static/images/gif/basket-spinner.gif"/></span>
      <div> Subscription to user's private feed sent. Waiting for approval </div>`,
      {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      },
    );
    const response = await follow(id);

    expect(response.id).toStrictEqual(id);
    expect(response.privateFeed).toStrictEqual(true);

    fetchMock.get(
      endpoints.follow(id).toString(),
      `<a href="#" class="btn btn-danger unfollow "  data-uid="${id}">Unfollow</a>
      <span class="loading hide"><img src="/earlyadopters/static/images/gif/basket-spinner.gif"/></span>
      <div> </div>`,
      {
        overwriteRoutes: true,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      },
    );
    const response2 = await follow(id);

    expect(response2.id).toStrictEqual(id);
    expect(response2.privateFeed).toStrictEqual(false);

    fetchMock.get(
      endpoints.follow(id).toString(),
      `<a href="#" class="btn btn-danger unfollow "  data-uid="${id}">Unfollow</a>
      <span class="loading hide"><img src="/earlyadopters/static/images/gif/basket-spinner.gif"/></span>`,
      {
        overwriteRoutes: true,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      },
    );

    const action = async () => {
      await follow(id);
    };

    await expect(action).rejects.toThrow(UnexpectedResponseException);
  });

  it('can unfollow a friend', async () => {
    const id = Math.ceil(Math.random() * 1000);
    fetchMock.get(
      endpoints.unfollow(id).toString(),
      `<a href="#" class="btn btn-info follow "  data-uid="${id}"> Follow </a>
      <span class="loading hide"><img src="/earlyadopters/static/images/gif/basket-spinner.gif"/></span>`,
    );
    await unfollow(id);

    expect(fetchMock.calls()).toHaveLength(1);

    fetchMock.get(endpoints.unfollow(id).toString(), ``, {
      overwriteRoutes: true,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    const action = async () => {
      await unfollow(id);
    };

    await expect(action).rejects.toThrow(UnexpectedResponseException);
  });
});
