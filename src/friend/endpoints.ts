import { apiURL, frontendURL } from '@support/client';

export default {
  get approveFollowerRequests() {
    return frontendURL('followingRequest/approve');
  },
  block: (id: number) => frontendURL('user/block?id={id}', { id }),
  get blockedUsers() {
    return apiURL('blocked');
  },
  follow: (id: number) => frontendURL('user/follow?id={id}', { id }),
  get followerRequests() {
    return frontendURL('followingRequest/index');
  },
  get followers() {
    return apiURL('followers');
  },
  get following() {
    return apiURL('following');
  },
  get followingRequests() {
    return apiURL('followingRequests');
  },
  get ignoreFollowerRequests() {
    return frontendURL('followingRequest/ignore');
  },
  hovercard: (id: number) => frontendURL('feed/hovercard?id={id}', { id }),
  unblock: (id: number) => frontendURL('user/unblock?id={id}', { id }),
  unfollow: (id: number) => frontendURL('user/unfollow?id={id}', { id }),
  get removeFollowerRequests() {
    return frontendURL('followingRequest/remove');
  },
};
