import { ffetch } from '@support/client';

import endpoints from './endpoints';

export const silenceRoom = async (id: number) => {
  await ffetch(endpoints.silence(id), { expectStatus: 302, redirect: 'manual' });
};

export const unsilenceRoom = async (id: number) => {
  await ffetch(endpoints.unsilence(id), { expectStatus: 302, redirect: 'manual' });
};
