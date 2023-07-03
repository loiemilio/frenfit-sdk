import { clearAuthCookies, getAuthCookies, setAuthCookies } from '../../src/auth';

test('can set authentication cookies', () => {
  const currentCookies = getAuthCookies();
  expect(currentCookies).toHaveProperty('jsessionId');
  expect(currentCookies.jsessionId).toBeNull();
  expect(currentCookies).toHaveProperty('frenfitCookie');
  expect(currentCookies.frenfitCookie).toBeNull();

  setAuthCookies('JSESSION_ID', 'FRENFIT_COOKIE');
  const newCookies = getAuthCookies();
  expect(newCookies.jsessionId).toEqual('JSESSION_ID');
  expect(newCookies.frenfitCookie).toEqual('FRENFIT_COOKIE');
});

test('can reset authentication cookies', () => {
  setAuthCookies('JSESSION_ID', 'FRENFIT_COOKIE');
  const currentCookies = getAuthCookies();
  expect(currentCookies.jsessionId).toEqual('JSESSION_ID');
  expect(currentCookies.frenfitCookie).toEqual('FRENFIT_COOKIE');

  clearAuthCookies();
  const newCookies = getAuthCookies();
  expect(newCookies).toHaveProperty('jsessionId');
  expect(newCookies.jsessionId).toBeNull();
  expect(newCookies).toHaveProperty('frenfitCookie');
  expect(newCookies.frenfitCookie).toBeNull();
});
