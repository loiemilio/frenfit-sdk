import { clearData, ffetch } from '@support/client';
import { InvalidCredentialsException, UnexpectedResponseException } from '@support/exceptions';
import store, { ME_KEY } from '@support/store';

import endpoints from './endpoints';
import { LoginRequest, MeResponse } from './types';

export default './endpoints';

export const authEndpoints = endpoints;

export const login = async (request: LoginRequest) => {
  clearData();

  const body = new URLSearchParams();
  body.set('j_username', request.username);
  body.set('j_password', request.password);

  const loginResponse = await ffetch(endpoints.login, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
    redirect: 'manual',
    expectStatus: 302,
  });

  const location = loginResponse.headers.get('Location');

  if (!location) {
    throw new UnexpectedResponseException(loginResponse, {
      missingHeader: 'Response does not provide return Location header',
    });
  }

  if (location.includes('/login/authfail?login_error')) {
    throw new InvalidCredentialsException();
  }
};

export const logout = async () => {
  await ffetch(endpoints.logout);
};

export const getMe = async (fetch = false) => {
  let me = store.get(ME_KEY) as MeResponse | undefined;

  if (!me || fetch) {
    const meResponse = await ffetch(endpoints.me);
    me = (await meResponse.json()) as MeResponse;

    store.set(ME_KEY, me);
  }

  return {
    avatarUrl: me.avatarUrl,
    class: 'it.senape.ff.dto.UserDto',
    fullName: me.fullName,
    id: me.id,
    locked: me.locked,
    username: me.username,
  };
};
