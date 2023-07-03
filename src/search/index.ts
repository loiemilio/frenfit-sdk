import { FrenfitException } from '@support/exceptions';

import endpoints from './endpoints';
import type { SearchRequest } from './types';
import { getEntry, listEntryIds } from '../feed';

export default './endpoints';

export const searchEntries = async (request: SearchRequest) => {
  if (request.query.trim().length < 4) {
    throw new FrenfitException('Query param should contains at least 4 characters');
  }

  const url = new URL(endpoints.search);

  url.searchParams.set('q', request.query.trim());
  url.searchParams.set('searchIn', request.within);

  if (request.feed?.trim()) {
    url.searchParams.set('feeds', request.feed);
  }

  if (request.commenter?.trim()) {
    url.searchParams.set('commenters', request.commenter);
  }

  url.searchParams.set('page', String(request.page || 1));

  const response = await listEntryIds(url);
  const entries = await Promise.all(response.ids.map(id => getEntry(id)));

  return Object.assign({ entries }, response);
};
