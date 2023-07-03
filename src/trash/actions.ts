import { ffetch } from '@support/client';

import endpoints from './endpoints';

export const emptyTrash = async () => {
  await ffetch(endpoints.emptyTrash());
};

export const restoreComment = async (id: number) => {
  await ffetch(endpoints.restoreComment(id), {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  });
};

export const restoreEntry = async (id: number) => {
  await ffetch(endpoints.restoreEntry(id), {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  });
};
