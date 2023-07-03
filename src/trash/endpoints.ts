import { frontendURL } from '@support/client';

export default {
  emptyTrash: () => frontendURL('trash/empty/{ts}', { ts: new Date().getTime() }),
  restoreComment: (commentId: number) => frontendURL('comment/restore/{commentId}', { commentId }),
  restoreEntry: (entryId: number) => frontendURL('feed/restore/{entryId}', { entryId }),
  trash: frontendURL('trash/index'),
};
