import { ffetch } from '@support/client';

import endpoints from './endpoints';
import { parseRoomsPage, sendRoomPageRequest } from './page';
import { AddRoomRequest, EditRoomRequest as EditRoomRequest } from './types';

export default './endpoints';
export * from './subscribers';

export const addRoom = async (request: AddRoomRequest) => {
  const result = await sendRoomPageRequest(endpoints.addRoom, request);
  const rooms = parseRoomsPage(result);

  return rooms.pop();
};

export const displayRoomEntriesInHome = async (id: number) => {
  await ffetch(endpoints.toggleInHome(id, 'true'), {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  });
};

export const editRoom = async (request: EditRoomRequest) => {
  await sendRoomPageRequest(endpoints.editRoom, request);

  const rooms = await listMyRooms();
  return rooms.find(r => r.name === request.username);
};

export const hideRoomEntriesFromHome = async (id: number) => {
  await ffetch(endpoints.toggleInHome(id, 'false'), {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  });
};

export const listMyRooms = async () => {
  const myRoomsResponse = await ffetch(endpoints.myRooms);
  const text = await myRoomsResponse.text();

  return parseRoomsPage(text);
};
