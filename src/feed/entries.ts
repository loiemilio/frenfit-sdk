import { ffetch } from '@support/client';

import { ListEntriesResponse } from './types';

export const listEntryIds = async (url: URL): Promise<ListEntriesResponse> => {
  const response = await ffetch(url);

  const text = await response.text();
  const pattern = /"entry"\s+id="(\d+)"/gm;
  const match = text.matchAll(pattern);

  const ids = [...match].map(([, id]) => parseInt(id, 10));

  const [, [pagination]] = text.split('<div class="pagination">').map(p => p.split('</ul>'));
  const pieces = pagination.split('<li ');
  const nextPage = !pieces[2].includes('disabled');

  return {
    ids,
    page: parseInt(url.searchParams.get('page') || '1'),
    nextPage,
  };
};
