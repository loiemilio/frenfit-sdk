import { frontendURL } from '@support/client';

export default {
  myRooms: frontendURL('room/index'),
  toggleInHome: (id: number, inHome: 'true' | 'false') =>
    frontendURL('room/toggleHome?id={id}&inHome={inHome}', { id, inHome }),
};
