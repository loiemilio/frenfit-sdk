import { apiURL, frontendURL } from '@support/client';

export default {
  bookmark: (entryId: number) => frontendURL('bookmark/bookmark/?id={entryId}', { entryId }),
  deleteEntry: (entryId: number) => frontendURL('feed/remove?id={entryId}', { entryId }),
  dislikeEntry: (id: number) => frontendURL('feed/dislike?id={id}', { id }),
  get editEntry() {
    return frontendURL('message/editEntry');
  },
  get emptyRoom() {
    return frontendURL('empty');
  },
  entry: (id: number) => apiURL('entry/{id}', { id }),
  get hideEntry() {
    return frontendURL('feed/hideEntry');
  },
  likeEntry: (id: number) => frontendURL('feed/like?id={id}', { id }),
  get postEntry() {
    return frontendURL('message/postToFrenfi');
  },
  unhideEntry: (id: number) => frontendURL('feed/restoreHiddenEntry?id={id}&restore=true', { id }),
};
