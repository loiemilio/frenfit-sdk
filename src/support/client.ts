import configuration from '@support/configuration';
import {
  FrenfitClientException,
  FrenfitServerException,
  InvalidCredentialsException,
  UnexpectedResponseException,
} from '@support/exceptions';
import { trail } from '@support/runtime';
import store, { FRENFIT_COOKE_KEY, JSESSIONID_KEY } from '@support/store';

type FFetchInit = {
  expectStatus?: number;
};

export const earlyAdoptersPath = (path: string) => `${configuration.earlyAdoptersPath}${path}`;

export const frontendURL = (path: string, substitutions: Record<string, string | number> = {}) => {
  path = Object.entries(substitutions).reduce((result, [key, value]) => {
    return result.replace(`{${key}}`, String(value));
  }, path);

  return new URL(`${configuration.frenfitAddress}/${earlyAdoptersPath(path)}`);
};

export const apiURL = (path: string, substitutions: Record<string, string | number> = {}) =>
  frontendURL(`${configuration.apiPath}${path}`, substitutions);

export const urlToString = (request: RequestInfo | URL) => {
  if (request instanceof Request) {
    return request.url;
  }
  if (request instanceof URL) {
    return request.href;
  }
  return request.toString();
};

const acceptJson = (init?: RequestInit & FFetchInit) => {
  return Object.assign(init || {}, {
    headers: Object.assign(init?.headers || {}, {
      Accept: (init?.headers as Record<string, string>)?.['Accept'] || 'application/json',
    }),
  });
};

const withAuthCookies = (init?: RequestInit & FFetchInit) => {
  const cookies: string[] = [];
  const jsessionId = store(JSESSIONID_KEY) as string;

  if (jsessionId) {
    cookies.push(`${JSESSIONID_KEY}=${jsessionId}`);
  }

  const jsessionId2 = store(FRENFIT_COOKE_KEY) as string;

  if (jsessionId2) {
    cookies.push(`${FRENFIT_COOKE_KEY}=${jsessionId2}`);
  }

  if (!cookies.length) {
    return init || {};
  }

  return Object.assign(init || {}, {
    headers: Object.assign(init?.headers || {}, {
      Cookie: cookies.join(';'),
    }),
  });
};

const extractCookieValue = (response: Response, cookieName: string) => {
  const setCookie = response.headers.get('Set-Cookie');
  const match = setCookie && new RegExp(`${cookieName}=(?<value>[^;\\s]+)`).exec(setCookie);

  return match?.groups?.value;
};

const storeAuthCookies = (response: Response) => {
  // Browsers and React Native may hide Set-Cookie and keep cookies themselves, so a missing one is not an error
  const jsessionId = store.get(JSESSIONID_KEY) as string;
  store.set(JSESSIONID_KEY, extractCookieValue(response, JSESSIONID_KEY) || jsessionId);

  const frenfitCookie = store.get(FRENFIT_COOKE_KEY) as string;
  store.set(FRENFIT_COOKE_KEY, extractCookieValue(response, FRENFIT_COOKE_KEY) || frenfitCookie);
};

export const clearData = () => {
  store.remove(JSESSIONID_KEY);
  store.remove(FRENFIT_COOKE_KEY);
};

const requestAborted = (error: Error | DOMException | unknown) => {
  return error instanceof DOMException || (error instanceof Error && error.name === 'AbortError') ? error : undefined;
};

export const ffetch = async (input: RequestInfo | URL, init?: RequestInit & FFetchInit) => {
  let response: Response;

  try {
    init = acceptJson(init);
    init = withAuthCookies(init);

    trail(() => {
      console.time('\ttiming');
      console.log(`[${new Date().toJSON()}] ${init?.method || 'GET'} request to ${urlToString(input)}`);
      console.log(`\taccepting: ${(init?.headers as Record<string, string>).Accept}`);
    });

    response = await fetch(input, init);
  } catch (error) {
    const exception = requestAborted(error);
    if (exception) {
      trail(() => {
        console.error(`\tConnection interrupted`);
      });

      throw new FrenfitClientException(input, exception);
    }

    throw error;
  }

  trail(() => {
    console.log(`\tstatus: ${response.status}`);
    console.log(`\tredirected: ${response.redirected ? response.url : 'no'}`);
    console.timeEnd('\ttiming');
  });

  storeAuthCookies(response);

  if (response.status >= 500 && response.status <= 599) {
    throw new FrenfitServerException(response);
  }

  if (response.redirected && response.url.includes(earlyAdoptersPath('login/auth'))) {
    throw new InvalidCredentialsException('Session expired or invalid');
  }

  const expectedStatus = init.expectStatus || 200;
  // React Native ignores redirect: 'manual' and follows the redirect; browsers return an opaque redirect
  const gotExpectedRedirect =
    expectedStatus >= 300 &&
    expectedStatus <= 399 &&
    ((response.redirected && response.ok) || response.type === 'opaqueredirect');

  if (response.status !== expectedStatus && !gotExpectedRedirect) {
    throw new UnexpectedResponseException(response, {
      url: urlToString(input),
      expectedStatus,
      gotStatus: response.status,
    });
  }

  return response;
};
