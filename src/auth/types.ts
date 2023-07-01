import type { FeedInfoResponse } from '../feed/types';

export type LoginRequest = {
  username: string;
  password: string;
};

export type MeResponse = FeedInfoResponse<'User'>;
