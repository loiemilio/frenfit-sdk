import { ffetch } from '@support/client';
import { UnexpectedResponseException } from '@support/exceptions';

import endpoints from './endpoints';
import { FollowResponse, FollowerRequestActionResponse } from './types';

const actOnFollowerRequests = async (url: URL, ids: number[]) => {
  const body = new URLSearchParams();
  ids.forEach(id => body.append('follower', String(id)));

  const response = await ffetch(url, {
    method: 'POST',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
    body,
  });

  return (await response.json()) as FollowerRequestActionResponse;
};

export const approveFollowerRequests = async (ids: number[]) =>
  actOnFollowerRequests(endpoints.approveFollowerRequests, ids);

export const blockFriend = (id: number) =>
  ffetch(endpoints.block(id), {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

export const ignoreFollowerRequests = async (ids: number[]) =>
  actOnFollowerRequests(endpoints.ignoreFollowerRequests, ids);

export const follow = async (id: number) => {
  const response = await ffetch(endpoints.follow(id), {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

  const text = await response.text();
  const pattern = /gif"\/>\s*<\/span>\s*<div>\s*(?<private>(\s[^\s]+)+)?\s*<\/div>/gm;
  const match = pattern.exec(text);

  if (!match?.groups) {
    throw new UnexpectedResponseException(response, {
      missingDiv: 'Follow response should contain a div for the possible private feed message',
    });
  }

  const privateFeed = !!match.groups.private;

  return {
    id,
    privateFeed,
  } as FollowResponse;
};

export const unblockFriend = (id: number) =>
  ffetch(endpoints.unblock(id), {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

export const unfollow = async (id: number) => {
  const response = await ffetch(endpoints.unfollow(id), {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

  const text = await response.text();
  if (!text.includes('btn btn-info follow')) {
    throw new UnexpectedResponseException(response, {
      missingDiv: 'Unfollow response should contain the button to follow again',
    });
  }
};

export const removeFollowerRequests = async (ids: number[]) =>
  actOnFollowerRequests(endpoints.removeFollowerRequests, ids);
