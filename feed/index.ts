import { apiURL, ffetch, frontendURL } from '@support/client';
import { FrenfitException, UnexpectedResponseException } from '@support/exceptions';

import { AddEntryRequest, EditEntryRequest, EntryResponse, TargetFeed } from './types';
import { decodeEntry } from './utils';

export const feedEndpoints = {
  bookmark: (entryId: number) => frontendURL('bookmark/bookmark/?id={entryId}', { entryId }),
  deleteEntry: (entryId: number) => frontendURL('feed/remove?id={entryId}', { entryId }),
  editEntry: frontendURL('message/editEntry'),
  emptyRoom: frontendURL('empty'),
  entry: (id: number) => apiURL('entry/{id}', { id }),
  postEntry: frontendURL('message/postToFrenfi'),
  restoreEntry: (entryId: number) => frontendURL('feed/restore/{entryId}', { entryId }),
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

export const deleteEntry = (id: number) => {
  return ffetch(feedEndpoints.deleteEntry(id), {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  });
};

export const editEntry = async (id: number, request: EditEntryRequest) => {
  const body = new URLSearchParams();
  body.set('id', String(id));
  body.set('message', request.message);

  await ffetch(feedEndpoints.editEntry, {
    method: 'POST',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
    body,
  });

  return await getEntry(id);
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

const ALLOWED_FILE_TYPES = ['image/png', 'image/x-png', 'image/gif', 'image/jpeg'];

export const postEntry = async (request: AddEntryRequest) => {
  const body = new FormData();

  body.set('message', request.message);
  request.recipientIds?.forEach(r => body.append('rcptId', String(r)));
  request.files?.forEach(f => {
    if (!ALLOWED_FILE_TYPES.includes(f.type)) {
      throw new FrenfitException(`Invalid file type ${f.type}`, undefined, {
        allowedTypes: ALLOWED_FILE_TYPES.join(', '),
      });
    }

    body.append('filesToUpload', f);
  });

  const response = await ffetch(feedEndpoints.postEntry, {
    method: 'POST',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
    body,
  });

  const entryContent = await response.text();
  const pattern = /class="entry"\s+id="(?<entryId>\d+)"/gm;
  const match = pattern.exec(entryContent);

  if (!match?.groups?.entryId) {
    throw new UnexpectedResponseException(response, {
      missingEntryId: 'Post-entry response does not contain new entry ID',
    });
  }

  const entryId = parseInt(match.groups.entryId, 10);
  return await getEntry(entryId);
};

export const restoreEntry = async (id: number) => {
  await ffetch(feedEndpoints.restoreEntry(id), {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  });
};
