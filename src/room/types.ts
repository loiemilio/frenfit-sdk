export type AddRoomRequest = {
  username: string;
  title: string;
  description?: string;
  avatar?: string;
  locked: boolean;
};

export type EditRoomRequest = AddRoomRequest & { id: number };
