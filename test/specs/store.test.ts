import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { LocalStorage } from 'node-localstorage';

import { setStorage } from '../../src';
import { getAuthCookies, setAuthCookies } from '../../src/auth';

test('can persist data in a custom storage', () => {
  const folder = mkdtempSync(join(tmpdir(), 'frenfit-sdk-'));

  try {
    setStorage(new LocalStorage(folder));
    setAuthCookies('JSESSION_ID', 'FRENFIT_COOKIE');

    setStorage(new LocalStorage(folder));
    const cookies = getAuthCookies();
    expect(cookies.jsessionId).toEqual('JSESSION_ID');
    expect(cookies.frenfitCookie).toEqual('FRENFIT_COOKIE');
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});
