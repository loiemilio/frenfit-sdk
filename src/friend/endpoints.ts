import { frontendURL } from '@support/client';

export default {
  follow: (id: number) => frontendURL('user/follow?id={id}', { id }),
  unfollow: (id: number) => frontendURL('user/unfollow?id={id}', { id }),
};
