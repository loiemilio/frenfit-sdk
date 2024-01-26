import { LocalStorage } from 'node-localstorage';
import storeInit from 'store2';

import configuration from '@support/configuration';

export const FRENFIT_COOKE_KEY = 'frenfitCookie';
export const JSESSIONID_KEY = 'JSESSIONID';
export const ME_KEY = 'me';
export const REQUESTS_TRAIL = '_trail';

export default typeof process !== 'undefined' && process.env.STORE_DRIVER === 'fs'
  ? storeInit.area('fs', new LocalStorage(configuration.temporaryFolder))
  : storeInit;
