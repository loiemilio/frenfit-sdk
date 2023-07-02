import { User } from 'src/types';

export const decodeUser = (user: User): User =>
  Object.assign({}, user, {
    fullName: user.fullName,
  });
