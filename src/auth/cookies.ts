import store, { FRENFIT_COOKE_KEY, JSESSIONID_KEY } from '@support/store';

export interface AuthCookies {
  jsessionId: string;
  frenfitCookie: string;
}

export const clearAuthCookies = () => setAuthCookies(null, null);

export const getAuthCookies = (): AuthCookies => ({
  jsessionId: store.get(JSESSIONID_KEY) as string | null,
  frenfitCookie: store.get(FRENFIT_COOKE_KEY) as string | null,
});

export const setAuthCookies = (jsessionId?: string, frenfitCookie?: string) => {
  store.set(JSESSIONID_KEY, jsessionId);
  store.set(FRENFIT_COOKE_KEY, frenfitCookie);
};
