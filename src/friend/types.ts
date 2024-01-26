import type { User } from '@frenfit-types';

export type FollowResponse = {
  id: number;
  privateFeed: boolean;
};

export type FollowersResponse = {
  user: User;
  usersList: User[];
};

export type HovercardResponse = {
  action: 'follow' | 'unfollow';
  bio: string;
  image: string;
  name: string;
  username: string;
};
