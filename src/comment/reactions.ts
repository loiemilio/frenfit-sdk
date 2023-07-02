import { ffetch } from '@support/client';
import { evaluateReactionResponse } from '@support/reactions';

import endpoints from './endpoints';

export const toggleCommentDislike = async (commentId: number) => {
  const dislikeResponse = await ffetch(endpoints.dislikeComment(commentId));
  const text = await dislikeResponse.text();

  return evaluateReactionResponse(text);
};

export const toggleCommentLike = async (commentId: number) => {
  const likeResponse = await ffetch(endpoints.likeComment(commentId));
  const text = await likeResponse.text();

  return evaluateReactionResponse(text);
};
