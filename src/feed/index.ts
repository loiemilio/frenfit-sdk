import { ffetch, frontendURL } from '@support/client';
import { FrenfitException, UnexpectedResponseException } from '@support/exceptions';

import { toggleBookmark } from './bookmark';
import endpoints from './endpoints';
import { listEntryIds } from './entries';
import { AddEntryRequest, EditEntryRequest, EntryResponse, ListEntriesRequest } from './types';
import { decodeEntry } from './utils';

export * from './bookmark';
export default './endpoints';
export * from './entries';
export * from './reactions';
export * from './recipients';
export * from './types';

const ALLOWED_FILE_TYPES = ['image/png', 'image/x-png', 'image/gif', 'image/jpeg'];

export const deleteEntry = (id: number) => {
  return ffetch(endpoints.deleteEntry(id), {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  });
};

export const editEntry = async (
  id: number,
  request: EditEntryRequest,
  options: {
    checkIfBookmarked?: boolean;
  } = {
    checkIfBookmarked: false,
  },
) => {
  const body = new URLSearchParams();
  body.set('id', String(id));
  body.set('message', request.message);

  await ffetch(endpoints.editEntry, {
    method: 'POST',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
    body,
  });

  return await getEntry(id, options);
};

export const getEntry = async (
  id: number,
  options: {
    checkIfBookmarked?: boolean;
  } = {
    checkIfBookmarked: true,
  },
) => {
  const [response, bookmarked] = await Promise.all([
    ffetch(endpoints.entry(id)),
    options.checkIfBookmarked && toggleBookmark(id).then(() => toggleBookmark(id)),
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

export const listEntries = async (request: ListEntriesRequest) => {
  const url = new URL(frontendURL(request.feed));
  request.page && url.searchParams.set('page', String(request.page));

  const response = await listEntryIds(url);
  const entries = await Promise.all(response.ids.map(id => getEntry(id)));

  return Object.assign({ entries }, response);
};

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

  const response = await ffetch(endpoints.postEntry, {
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
  return await getEntry(entryId, { checkIfBookmarked: false });
};
