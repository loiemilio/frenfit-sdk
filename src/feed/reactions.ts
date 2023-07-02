import { ffetch } from '@support/client';
import { evaluateReactionResponse } from '@support/reactions';

import endpoints from './endpoints';

export const toggleEntryDislike = async (entryId: number) => {
  const dislikeResponse = await ffetch(endpoints.dislikeEntry(entryId), {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  });
  const text = await dislikeResponse.text();

  return evaluateReactionResponse(text);
};

export const toggleEntryLike = async (entryId: number) => {
  const likeResponse = await ffetch(endpoints.likeEntry(entryId), {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  });
  const text = await likeResponse.text();

  return evaluateReactionResponse(text);
};
