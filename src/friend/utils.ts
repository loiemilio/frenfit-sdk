import type { User } from '@frenfit-types';

export const decodeUser = (user: User): User =>
  Object.assign({}, user, {
    fullName: user.fullName,
  });
