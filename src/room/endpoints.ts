import { frontendURL } from '@support/client';

export default {
  addRoom: frontendURL('room/save'),
  editRoom: frontendURL('room/update'),
  myRooms: frontendURL('room/index'),
  toggleInHome: (id: number, inHome: 'true' | 'false') =>
    frontendURL('room/toggleHome?id={id}&inHome={inHome}', { id, inHome }),
};
