import { apiURL, ffetch, frontendURL } from '@support/client';
import { UnexpectedResponseException } from '@support/exceptions';

import { EntryResponse } from './types';
import { decodeEntry } from './utils';

export const feedEndpoints = {
  entry: (id: number) => apiURL('entry/{id}', { id }),
  bookmark: (entryId: number) => frontendURL('bookmark/bookmark/?id={entryId}', { entryId }),
};

export const toggleBookmark = async (entryId: number) => {
  const response = await ffetch(feedEndpoints.bookmark(entryId));
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

export const getEntry = async (id: number) => {
  const [response, bookmarked] = await Promise.all([
    ffetch(feedEndpoints.entry(id)),
    toggleBookmark(id).then(() => toggleBookmark(id)),
  ]);

  const { isHidden, entry } = (await response.json()) as EntryResponse;

  entry.bookmarked = bookmarked;
  entry.firstComment = entry.comments[0];
  entry.isHidden = isHidden;
  entry.lastComment = entry.totalComments > 1 ? entry.comments[entry.comments.length - 1] : undefined;
  entry.linkCount ||= 0;
  entry.origin ||= undefined;

  return decodeEntry(entry);
};
