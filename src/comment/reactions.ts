import { MyPreference, type Preferences } from '@frenfit-types';
import { ffetch } from '@support/client';

import endpoints from './endpoints';

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
  const dislikeResponse = await ffetch(endpoints.dislikeComment(commentId));
  const text = await dislikeResponse.text();

  return evaluateReactionResponse(text);
};

export const toggleCommentLike = async (commentId: number) => {
  const likeResponse = await ffetch(endpoints.likeComment(commentId));
  const text = await likeResponse.text();

  return evaluateReactionResponse(text);
};
