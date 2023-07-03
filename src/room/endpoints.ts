import { frontendURL } from '@support/client';

export default {
  addRoom: frontendURL('room/save'),
  approveSubscribeRequest: (roomId: number, userId: number) =>
    frontendURL('room/approve?frenf={userId}&roomId={roomId}', {
      roomId,
      userId,
    }),
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
  search: (query: string) => frontendURL('room/search?q={query}', { query: encodeURIComponent(query) }),
  silence: (id: number) => frontendURL('room/silence/{id}', { id }),
  toggleInHome: (id: number, inHome: 'true' | 'false') =>
    frontendURL('room/toggleHome?id={id}&inHome={inHome}', { id, inHome }),
  unsilence: (id: number) => frontendURL('room/desilence/{id}', { id }),
  unsubscribe: frontendURL('room/unsubscribe'),
};
