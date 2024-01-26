import { decodeHTML } from 'entities';

import { MyPreference } from '@frenfit-types';
import { ffetch } from '@support/client';

import endpoints from './endpoints';
import { AddCommentRequest, AddCommentResponse } from './types';
import { getMe } from '../auth';

export default './endpoints';
export * from './reactions';
export * from './utils';

export const addComment = async (entryId: number, request: AddCommentRequest) => {
  const sender = await getMe();

  const addCommentResponse = await ffetch(endpoints.addComment, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({
      text: request.comment,
      entryId,
      sender: sender.id,
    }),
  });

  const comment = (await addCommentResponse.json()) as AddCommentResponse;

  return {
    blocked: false,
    class: 'it.senape.ff.dto.CommentDto',
    dateCreated: comment.dateCreated,
    deleted: false,
    dislikers: [],
    dislikes: 0,
    entryId,
    id: comment.id,
    likers: [],
    likes: 0,
    myPreference: MyPreference.none,
    origin: undefined,
    sender,
    text: decodeHTML(comment.text),
  };
};

export const removeComment = async (commentId: number) => {
  await ffetch(endpoints.removeComment(commentId));
};
