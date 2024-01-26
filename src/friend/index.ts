import { decodeHTML } from 'entities';

import type { User } from '@frenfit-types';
import { ffetch } from '@support/client';
import { UnexpectedResponseException } from '@support/exceptions';

import endpoints from './endpoints';
import { FollowersResponse, HovercardResponse } from './types';
import { decodeUser } from './utils';
import feedEndpoints from '../feed/endpoints';

export * from './actions';
export default './endpoints';
export * from './utils';

export const getFriend = async (id: number) => {
  const response = await ffetch(endpoints.hovercard(id));
  const content = (await response.json()) as HovercardResponse;

  return {
    id,
    following: content.action === 'unfollow',
    fullName: content.name,
    username: content.username,
    avatarUrl: content.image,
  } as User;
};

export const getHovercard = async (id: number): Promise<HovercardResponse> => {
  const response = await ffetch(endpoints.hovercard(id));

  const hovercard = (await response.json()) as HovercardResponse;

  return Object.assign(hovercard, {
    bio: decodeHTML(hovercard.bio),
    name: decodeHTML(hovercard.name),
  });
};

export const listFollowers = async () => {
  const response = await ffetch(endpoints.followers);
  const content = (await response.json()) as FollowersResponse;

  return content.usersList.map(decodeUser);
};

export const listFollowing = async () => {
  const response = await ffetch(endpoints.following);
  const content = (await response.json()) as FollowersResponse;

  return content.usersList.map(decodeUser);
};

export const listFollowerRequests = async () => {
  const response = await ffetch(endpoints.followerRequests);
  const content = await response.text();

  const [newPart, ignoredPart] = content.split('id="ignoredRequests"');
  const pattern = /class="[^"]*card[^"]*"\s+id="(\d+)"/gm;
  const newMatches = [...newPart.matchAll(pattern)];
  const ignoredMatches = [...ignoredPart.matchAll(pattern)];

  const users = await Promise.all([...newMatches, ...ignoredMatches].map(([, id]) => getFriend(parseInt(id, 10))));

  return {
    newRequests: users.slice(0, newMatches.length).map(decodeUser),
    ignoredRequests: users.slice(newMatches.length).map(decodeUser),
  };
};

export const listFollowingRequests = async () => {
  const response = await ffetch(endpoints.followingRequests);
  const content = (await response.json()) as FollowersResponse;

  return content.usersList.map(decodeUser);
};

export const listBlocked = async (includeBlockedBy = false) => {
  if (includeBlockedBy) {
    const emptyRoomResponse = await ffetch(feedEndpoints.emptyRoom);
    const pageContent = await emptyRoomResponse.text();

    const pattern = /var\s+blockedIdList\s*=\s*(?<ids>\[[\d,\s]+\]);/gm;
    const match = pattern.exec(pageContent);
    if (!match?.groups?.ids) {
      throw new UnexpectedResponseException(emptyRoomResponse, {
        reason: 'Page does not contain blockedIdList list',
      });
    }

    const ids = JSON.parse(match.groups.ids) as number[];

    return await Promise.all(ids.map(getFriend));
  }
  const response = await ffetch(endpoints.blockedUsers);
  const content = (await response.json()) as FollowersResponse;

  return content.usersList.map(decodeUser);
};
