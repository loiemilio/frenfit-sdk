import { apiURL, frontendURL } from '@support/client';

export default {
  blockedUsers: apiURL('blocked'),
  follow: (id: number) => frontendURL('user/follow?id={id}', { id }),
  followerRequests: frontendURL('followingRequest/index'),
  followers: apiURL('followers'),
  following: apiURL('following'),
  followingRequests: apiURL('followingRequests'),
  hovercard: (id: number) => frontendURL('feed/hovercard?id={id}', { id }),
  unfollow: (id: number) => frontendURL('user/unfollow?id={id}', { id }),
};
