import { apiURL, frontendURL } from '@support/client';

export default {
  bookmark: (entryId: number) => frontendURL('bookmark/bookmark/?id={entryId}', { entryId }),
  deleteEntry: (entryId: number) => frontendURL('feed/remove?id={entryId}', { entryId }),
  dislikeEntry: (id: number) => frontendURL('feed/dislike?id={id}', { id }),
  editEntry: frontendURL('message/editEntry'),
  emptyRoom: frontendURL('empty'),
  entry: (id: number) => apiURL('entry/{id}', { id }),
  hideEntry: frontendURL('feed/hideEntry'),
  likeEntry: (id: number) => frontendURL('feed/like?id={id}', { id }),
  postEntry: frontendURL('message/postToFrenfi'),
  unhideEntry: (id: number) => frontendURL('feed/restoreHiddenEntry?id={id}&restore=true', { id }),
};
