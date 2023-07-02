import { ffetch } from '@support/client';
import { UnexpectedResponseException } from '@support/exceptions';
import { evaluateReactionResponse } from '@support/reactions';

import endpoints from './endpoints';

import { getEntry } from '.';

export const hideEntry = async (entryId: number) => {
  const body = new URLSearchParams();
  body.set('id', String(entryId));

  const hideResponse = await ffetch(endpoints.hideEntry, {
    method: 'POST',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
    body,
  });

  const text = await hideResponse.text();

  return text.includes(`restoreEntry('${entryId}')`);
};

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

export const unhideEntry = async (entryId: number) => {
  const unhideResponse = await ffetch(endpoints.unhideEntry(entryId), {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

  const text = await unhideResponse.text();
  if (!text.includes(`id="${entryId}"`)) {
    throw new UnexpectedResponseException(unhideResponse, {
      missingEntry: 'The requested entry was not returned after un-hide',
    });
  }

  return await getEntry(entryId);
};
