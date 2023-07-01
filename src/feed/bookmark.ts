import { ffetch } from '@support/client';
import { UnexpectedResponseException } from '@support/exceptions';

import endpoints from './endpoints';

export const toggleBookmark = async (entryId: number) => {
  const response = await ffetch(endpoints.bookmark(entryId));
  const text = await response.text();

  const pattern = /class="icon icon-bookmark (?<notBookmarked>icon-gray)?/g;
  const match = pattern.exec(text);

  if (!match?.groups) {
    throw new UnexpectedResponseException(response, {
      error: `Response does not match ${String(pattern)}`,
      entryId,
    });
  }

  return !match.groups.notBookmarked;
};
