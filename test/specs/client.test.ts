import fetchMock from 'fetch-mock';

import { ffetch } from '@sdk/support/client';
import { FrenfitClientException } from '@sdk/support/exceptions';

afterEach(() => {
  fetchMock.restore();
});

test('it throws FrenfitClientException on network issues', async () => {
  const controller = new AbortController();

  const action = async () => {
    fetchMock.get('*', () => {
      controller.abort();
    });
    await ffetch('<anywhere>', { signal: controller.signal });
  };

  await expect(action).rejects.toThrow(FrenfitClientException);
});
