import { ffetch, frontendURL } from '@support/client';

import { MyPreference, Preferences } from '../../types';
import { me } from '../auth';
import { AddCommentRequest, AddCommentResponse } from './types';

export const commentEndpoints = {
  addComment: frontendURL('wbMessage/addComment'),
  dislikeComment: (id: number) => frontendURL('comment/dislike?id={id}', { id }),
  likeComment: (id: number) => frontendURL('comment/like?id={id}', { id }),
  removeComment: (id: number) => frontendURL('message/remove?id={id}', { id }),
};

export const addComment = async (entryId: number, request: AddCommentRequest) => {
  const sender = await me();

  const addCommentResponse = await ffetch(commentEndpoints.addComment, {
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
    text: comment.text,
  };
};

const evaluateReactionResponse = (text: string): Preferences => {
  let myPreference: MyPreference = MyPreference.none;

  let pattern = /<i class="icon icon-dislike(?<disliked>-active)">/g;
  let match = pattern.exec(text);

  if (match?.groups?.disliked) {
    myPreference = MyPreference.dislike;
  } else {
    pattern = /<i class="icon icon-like(?<liked>-active)">/g;
    match = pattern.exec(text);
    if (match?.groups?.liked) {
      myPreference = MyPreference.like;
    }
  }

  pattern = /data-retrieve="like">(?<likes>\d+)<\/a>/;
  match = pattern.exec(text);
  const likes = parseInt(match?.groups?.likes, 10) || 0;

  pattern = /data-retrieve="dislike">(?<dislikes>\d+)<\/a>/;
  match = pattern.exec(text);
  const dislikes = parseInt(match?.groups?.dislikes, 10) || 0;

  return {
    dislikes,
    likes,
    myPreference,
  };
};

export const toggleCommentDislike = async (commentId: number) => {
  const dislikeResponse = await ffetch(commentEndpoints.dislikeComment(commentId));
  const text = await dislikeResponse.text();

  return evaluateReactionResponse(text);
};

export const toggleCommentLike = async (commentId: number) => {
  const likeResponse = await ffetch(commentEndpoints.likeComment(commentId));
  const text = await likeResponse.text();

  return evaluateReactionResponse(text);
};

export const removeComment = (commentId: number) => ffetch(commentEndpoints.removeComment(commentId));
