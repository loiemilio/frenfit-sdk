import fetchMock from 'fetch-mock';

import { AuthCookies, authEndpoints, getAuthCookies, getMe, login, logout, setAuthCookies } from '@sdk/auth';
import { InvalidCredentialsException, UnexpectedResponseException } from '@sdk/support/exceptions';
import store, { FRENFIT_COOKE_KEY, JSESSIONID_KEY, ME_KEY } from '@sdk/support/store';
import { mockFrenfitResponse, randomString } from '@test/support/utils';

afterEach(() => {
  fetchMock.restore();
});

test('it throws UnexpectedResponseException when no location header found', async () => {
  fetchMock.post(
    authEndpoints.login.toString(),
    mockFrenfitResponse({
      status: 302,
    }),
  );

  const action = async () => {
    await login({
      password: randomString(),
      username: randomString(),
    });
  };

  await expect(action).rejects.toThrow(UnexpectedResponseException);
});

test('it throws InvalidCredentialsException on failed logins', async () => {
  fetchMock.post(
    authEndpoints.login.toString(),
    mockFrenfitResponse({
      headers: {
        Location: '/login/authfail?login_error',
      },
      status: 302,
    }),
  );

  const action = async () => {
    await login({
      password: randomString(),
      username: randomString(),
    });
  };

  await expect(action).rejects.toThrow(InvalidCredentialsException);
});

test('it stores auth cookies on successful logins', async () => {
  const cookies = {
    [JSESSIONID_KEY]: randomString(),
    [FRENFIT_COOKE_KEY]: randomString(),
  };

  fetchMock.post(
    authEndpoints.login.toString(),
    mockFrenfitResponse({
      headers: {
        Location: '/',
        'Set-Cookie': Object.entries(cookies)
          .map(([key, value]) => `${key}=${value}`)
          .join(';'),
      },
      status: 302,
    }),
  );

  const result = await login({
    password: randomString(),
    username: randomString(),
  });

  expect(result).toEqual({
    jsessionId: cookies[JSESSIONID_KEY],
    frenfitCookie: cookies[FRENFIT_COOKE_KEY],
  } as AuthCookies);
});

test('it clears auth cookies on logout', async () => {
  setAuthCookies(randomString(), randomString());

  const currentCookies = getAuthCookies();
  expect(currentCookies.frenfitCookie).not.toBeNull();
  expect(currentCookies.jsessionId).not.toBeNull();

  fetchMock.get(
    authEndpoints.logout.toString(),
    mockFrenfitResponse({
      status: 200,
    }),
  );

  await logout();

  const cookies = getAuthCookies();
  expect(cookies.frenfitCookie).toBeNull();
  expect(cookies.jsessionId).toBeNull();
});

describe('getting me', () => {
  test('it does not contact server if me details are already stored', async () => {
    const me = {
      avatarUrl: randomString(),
      fullName: randomString(),
      id: randomString(),
      locked: false,
      username: randomString(),
    };

    store.set(ME_KEY, me);

    fetchMock.get(authEndpoints.me.toString(), () => {
      throw new Error('this shoul not have happened!');
    });

    const newMe = await getMe();

    expect(newMe).toEqual(Object.assign({ type: 'User' }, me));
  });

  test('it contacts server if me details are not available', async () => {
    const me = {
      avatarUrl: randomString(),
      fullName: randomString(),
      id: randomString(),
      locked: false,
      username: randomString(),
    };

    store.remove(ME_KEY);

    fetchMock.get(
      authEndpoints.me.toString(),
      mockFrenfitResponse({
        body: me,
      }),
    );

    const newMe = await getMe();

    expect(newMe).toEqual(Object.assign({ type: 'User' }, me));
  });

  test('it contacts server if forced to', async () => {
    const me = {
      avatarUrl: randomString(),
      fullName: randomString(),
      id: randomString(),
      locked: false,
      username: randomString(),
    };

    store.set(ME_KEY, {
      avatarUrl: randomString(),
      fullName: randomString(),
      id: randomString(),
      locked: false,
      username: randomString(),
    });

    fetchMock.get(
      authEndpoints.me.toString(),
      mockFrenfitResponse({
        body: me,
      }),
    );

    const newMe = await getMe(true);

    expect(newMe).toEqual(Object.assign({ type: 'User' }, me));
  });
});
