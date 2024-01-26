import store, { REQUESTS_TRAIL } from '@support/store';

export const disableRequestsTrail = () => {
  store.set(REQUESTS_TRAIL, false);
};

export const enableRequestsTrail = () => {
  store.set(REQUESTS_TRAIL, true);
};

export const isRequestsTrailEnabled = () => (store.get(REQUESTS_TRAIL) as boolean) || false;

export const trail = (callback: () => void) => {
  isRequestsTrailEnabled() && callback();
};
