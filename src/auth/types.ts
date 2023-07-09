export type LoginRequest = {
  username: string;
  password: string;
};

export type MeResponse = {
  id: number;
  username: string;
  fullName: string;
  description?: string;
  locked: boolean;
  type: 'User';
  avatarUrl?: string;
  email?: string;
};
