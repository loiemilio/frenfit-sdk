import { frontendURL } from '@support/client';

export default {
  addRoom: frontendURL('room/save'),
  editRoom: frontendURL('room/update'),
  listIgnoredRequests: (id: number, page = 1) =>
    frontendURL('room/getIgnoredRequests?id={id}&offset={offset}&max=24&page={page}', {
      id,
      page,
      offset: 24 * (page - 1),
    }),
  listPendingRequests: (id: number, page = 1) =>
    frontendURL('room/getPendingRequests?id={id}&offset={offset}&max=24&page={page}', {
      id,
      page,
      offset: 24 * (page - 1),
    }),
  listSubscribers: (name: string, page = 1) =>
    frontendURL('room/subscribers?username={name}&offset={offset}&max=24&page={page}', {
      name,
      page,
      offset: 24 * (page - 1),
    }),
  myRooms: frontendURL('room/index'),
  toggleInHome: (id: number, inHome: 'true' | 'false') =>
    frontendURL('room/toggleHome?id={id}&inHome={inHome}', { id, inHome }),
};
