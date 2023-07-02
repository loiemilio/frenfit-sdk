import { apiURL, frontendURL } from '@support/client';

export default {
  bookmark: (entryId: number) => frontendURL('bookmark/bookmark/?id={entryId}', { entryId }),
  deleteEntry: (entryId: number) => frontendURL('feed/remove?id={entryId}', { entryId }),
  editEntry: frontendURL('message/editEntry'),
  emptyRoom: frontendURL('empty'),
  entry: (id: number) => apiURL('entry/{id}', { id }),
  postEntry: frontendURL('message/postToFrenfi'),
  restoreEntry: (entryId: number) => frontendURL('feed/restore/{entryId}', { entryId }),
};
