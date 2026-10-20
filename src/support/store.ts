import storeInit, { StoreBase } from 'store2';

export const FRENFIT_COOKE_KEY = 'frenfitCookie';
export const JSESSIONID_KEY = 'JSESSIONID';
export const ME_KEY = 'me';
export const REQUESTS_TRAIL = '_trail';

let store: StoreBase = storeInit;

export const setStorage = (storage: Storage) => {
  store = storeInit.area('frenfit', storage);
};

export { store as default };
