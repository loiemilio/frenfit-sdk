import { apiURL, frontendURL } from '@support/client';

export default {
  get login() {
    return frontendURL('j_spring_security_check?id=loginForm');
  },
  get logout() {
    return frontendURL('j_spring_security_logout');
  },
  get me() {
    return apiURL('feedinfo');
  },
};
