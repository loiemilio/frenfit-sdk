import { apiURL, frontendURL } from '@support/client';

export default {
  login: frontendURL('j_spring_security_check?id=loginForm'),
  logout: frontendURL('j_spring_security_logout'),
  me: apiURL('feedinfo'),
};
