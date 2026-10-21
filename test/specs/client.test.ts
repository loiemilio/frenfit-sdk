import fetchMock from 'fetch-mock';

import { clearData, ffetch } from '@sdk/support/client';
import { FrenfitClientException, UnexpectedResponseException } from '@sdk/support/exceptions';
import { mockFrenfitResponse, opaqueRedirectResponse } from '@test/support/utils';

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

test('it accepts a followed redirect when a redirect was expected', async () => {
  fetchMock.get(
    'https://www.frenf.it/somewhere',
    mockFrenfitResponse({ redirectUrl: 'https://www.frenf.it/elsewhere', status: 200 }),
  );

  const response = await ffetch('https://www.frenf.it/somewhere', { expectStatus: 302, redirect: 'manual' });

  expect(response.status).toEqual(200);
});

test('it rejects a followed redirect when no redirect was expected', async () => {
  fetchMock.get(
    'https://www.frenf.it/somewhere',
    mockFrenfitResponse({ redirectUrl: 'https://www.frenf.it/elsewhere', status: 201 }),
  );

  const action = async () => {
    await ffetch('https://www.frenf.it/somewhere');
  };

  await expect(action).rejects.toThrow(UnexpectedResponseException);
});

test('it does not send an empty Cookie header', async () => {
  clearData();
  fetchMock.get('https://www.frenf.it/somewhere', mockFrenfitResponse({ status: 200 }));

  await ffetch('https://www.frenf.it/somewhere');

  expect(fetchMock.lastOptions().headers).not.toHaveProperty('Cookie');
});

test('it accepts an opaque redirect when a redirect was expected', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValueOnce(opaqueRedirectResponse());

  const response = await ffetch('https://www.frenf.it/somewhere', { expectStatus: 302, redirect: 'manual' });

  expect(response.type).toEqual('opaqueredirect');
});

test('it does not require Set-Cookie when no session is stored', async () => {
  clearData();
  fetchMock.get('https://www.frenf.it/somewhere', { status: 200 });

  const response = await ffetch('https://www.frenf.it/somewhere');

  expect(response.status).toEqual(200);
});
