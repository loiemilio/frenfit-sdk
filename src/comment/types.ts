import type { User } from '@frenfit-types';

export type AddCommentRequest = {
  comment: string;
};

export type AddCommentResponse = {
  sender: User;
  id: number;
  text: string;
  entryProviders: number[];
  dateCreated: string;
  uuid: string;
  commentId: number;
  entryId: number;
};
