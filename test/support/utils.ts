import { MockResponseObject } from 'fetch-mock';

import { FRENFIT_COOKE_KEY, JSESSIONID_KEY } from '@sdk/support/store';

export function initContext<T>(o: Partial<T> = {}): T {
  return new Proxy(o, {
    get: (t, p) => {
      if (!Reflect.has(t, p) || Reflect.get(t, p) === undefined) {
        throw new Error(`${String(p)} is not defined`);
      }
      return Reflect.get(t, p);
    },
  }) as T;
}

export function randomString(length = 12) {
  return [...Array(Math.ceil(length / 12)).keys()]
    .map(() =>
      Math.random()
        .toString(36)
        .replace(/[^a-zA-Z0-9]+/g, ''),
    )
    .join('')
    .substring(0, length);
}

export const mockFrenfitResponse = (init?: MockResponseObject & { body?: string | object }) => {
  return Object.assign({}, init, {
    headers: Object.assign(
      {
        'Set-Cookie': `${JSESSIONID_KEY}=x;${FRENFIT_COOKE_KEY}=y`,
      },
      init.headers || {},
    ),
  });
};
