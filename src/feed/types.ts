import type { Message } from '@frenfit-types';

export type AddEntryRequest = {
  recipientIds?: number[];
  message: string;
  files?: (Blob | File)[];
  // user (?)
};

export type EditEntryRequest = {
  message: string;
};

export type EntryResponse = {
  isHidden: boolean;
  entry: Message;
};

export type FeedInfoResponse<T> = {
  id: number;
  username: string;
  fullName: string;
  description?: string;
  locked: boolean;
  type: T;
  avatarUrl?: string;
  email?: string;
};

export type TargetFeed = {
  fullname: string;
  name: string;
  id: number;
  isRoom: boolean;
};
