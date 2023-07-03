import type { Room } from '@frenfit-types';
import { RoomStatus } from '@frenfit-types';
import { ffetch, frontendURL } from '@support/client';
import { NotImplementedException } from '@support/exceptions';

import endpoints from './endpoints';
import { parseRoomsPage, sendRoomPageRequest } from './page';
import { AddRoomRequest, EditRoomRequest as EditRoomRequest } from './types';

export * from './actions';
export default './endpoints';
export * from './search';
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

export const getRoom = () => {
  throw new NotImplementedException("This is tough! It's all scraping from the page room");

  // const response = await ffetch(frontendURL(encodeURIComponent(name)));
  // const text = await response.text();

  // let [, roomInfo] = text.split('id="roomHeader"');
  // [roomInfo] = roomInfo.split('id="subscribers"');

  // const imgPattern = /<img[^>]*\ssrc="\/?(?<image>[^"]+)"/g;
  // const match = imgPattern.exec(roomInfo);

  // let avatar = match?.groups?.image as string;
  // avatar = avatar?.startsWith(configuration.earlyAdoptersPath) ? frontendURL(avatar || '').href : avatar;

  // console.log(avatar);

  // {
  //   id: number;
  //   admin: boolean;
  //   avatar: string;
  //   inList: boolean;
  //   locked: boolean;
  //   silenced?: RoomStatus;
  //   name: string;
  //   title: string;
  // }
};

export const silenceRoomStatus = async (room: Room) => {
  const response = await ffetch(frontendURL(encodeURIComponent(room.name)));

  const text = await response.text();

  if (text.includes(`/room/silence/${room.id}`)) {
    return RoomStatus.notSilenced;
  }

  if (text.includes(`/room/desilence/${room.id}`)) {
    return RoomStatus.silenced;
  }

  return undefined;
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
