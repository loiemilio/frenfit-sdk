import { User } from '../../types';

export type AddRoomRequest = {
  username: string;
  title: string;
  description?: string;
  avatar?: string;
  locked: boolean;
};

export type EditRoomRequest = AddRoomRequest & { id: number };

export type listSubscriberResponse = {
  page: number;
  lastPage: number;
  subscribers: User[];
  total: number;
};
