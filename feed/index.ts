import { apiURL, ffetch, frontendURL } from '@support/client';
import { UnexpectedResponseException } from '@support/exceptions';

import { EntryResponse, TargetFeed } from './types';
import { decodeEntry } from './utils';

export const feedEndpoints = {
  bookmark: (entryId: number) => frontendURL('bookmark/bookmark/?id={entryId}', { entryId }),
  emptyRoom: frontendURL('empty'),
  entry: (id: number) => apiURL('entry/{id}', { id }),
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

export const listRecipients = async () => {
  const emptyRoomResponse = await ffetch(feedEndpoints.emptyRoom);
  const pageContent = await emptyRoomResponse.text();

  const pattern = /var\s+flwz\s*=\s*(?<recipients>\{[^}]+\});+/gm;
  const match = pattern.exec(pageContent);
  if (!match?.groups?.recipients) {
    throw new UnexpectedResponseException(emptyRoomResponse, {
      reason: 'Page does not contain flwz list',
    });
  }

  const recipients = JSON.parse(match.groups.recipients) as Record<string, number>;

  return Object.entries(recipients).map(([name, id]) => {
    const pattern = /^(?<isRoom><i>)?(?<fullname>.*)\s+\((?<name>[^)]+)\s*\)/;
    const match = pattern.exec(name);

    return {
      id,
      name: match?.groups?.name,
      fullname: match?.groups?.fullname,
      isRoom: !!match?.groups?.isRoom,
    } as TargetFeed;
  });
};
