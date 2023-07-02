import { getFriend } from '@sdk/friend';
import { ffetch } from '@support/client';

import endpoints from './endpoints';

const listSubscribers = async (url: URL) => {
  const response = await ffetch(url, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

  const text = await response.text();
  const pattern = /<div\sclass="card[^"]+"\sid="(\d+)">/g;
  const matches = text.matchAll(pattern);
  const subscribers = await Promise.all([...matches].map(([, id]) => getFriend(parseInt(id, 10))));

  const currentStepPattern = /<span class="currentStep">(?<currentPage>\d+)<\/span>/g;
  const match = currentStepPattern.exec(text);
  const page = parseInt(match?.groups?.currentPage || '1', 10);

  const paginationPattern = /class="step">(\d+)<\/a>/g;
  const paginationMatches = text.matchAll(paginationPattern);
  const lastPage = parseInt([...paginationMatches].map(([, num]) => num).findLast(([, num]) => num) || '1', 10);

  const totalPattern = /total="(?<total>\d+)"/g;
  const totalMatch = totalPattern.exec(text);
  const total = parseInt(totalMatch?.groups?.total || '0', 10) || subscribers.length;

  return {
    page,
    lastPage,
    subscribers,
    total,
  };
};

export const approveRoomSubscribeRequest = async (roomId: number, userId: number) => {
  await ffetch(endpoints.approveSubscribeRequest(roomId, userId));
};

export const listRoomPendingRequests = (id: number) => listSubscribers(endpoints.listPendingRequests(id));

export const listRoomSubscribers = (name: string, page = 1) => listSubscribers(endpoints.listSubscribers(name, page));

export const unsubscribeFromRoom = async (id: number) => {
  const body = new URLSearchParams();
  body.set('id', String(id));

  await ffetch(endpoints.unsubscribe, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
};
