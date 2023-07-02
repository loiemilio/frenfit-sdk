import { MyPreference, type Preferences } from '@frenfit-types';

export const evaluateReactionResponse = (text: string): Preferences => {
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
  const likes = parseInt(match?.groups?.likes || '0', 10);

  pattern = /data-retrieve="dislike">(?<dislikes>\d+)<\/a>/;
  match = pattern.exec(text);
  const dislikes = parseInt(match?.groups?.dislikes || '0', 10);

  return {
    dislikes,
    likes,
    myPreference,
  };
};
