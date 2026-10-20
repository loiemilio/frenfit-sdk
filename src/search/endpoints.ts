import { frontendURL } from '@support/client';

export default {
  get search() {
    return frontendURL('search/index');
  },
};
