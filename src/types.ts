export type Values<T> = T[keyof T];

export type Comment = {
  blocked: boolean;
  class: 'it.senape.ff.dto.CommentDto';
  dateCreated: string;
  dateDeleted?: string;
  deleted: boolean;
  dislikers: User[];
  dislikes: number;
  entryId: number;
  id: number;
  likers: User[];
  likes: number;
  myPreference: MyPreference;
  origin?: Origin;
  sender: User;
  text: string | 'Comment hidden' | 'Commento nascosto';
  uuid?: string;
};

export enum LinkType {
  Image = 'Image',
  Soundcloud = 'Soundcloud',
  Url = 'Url',
  Video = 'Video',
}

export type EntryLink = {
  address: string;
  class: 'it.senape.ff.dto.EntryLinkDto';
  entryId: number;
  id: number;
  thumbnail: string;
  type: LinkType;
};

export const FeedPath = {
  best: 'f/best',
  bookmarks: 'bookmarks',
  discussions: 'feed/discussions',
  dm: 'messages/direct',
  home: '',
  public: 'f/world',
  rooms: 'f/rooms',
} as const;

export type FeedPath = Values<typeof FeedPath> | string;

export type Message = {
  bookmarked: boolean;
  class: 'it.senape.ff.dto.MessageDto';
  //   commenters: []; //unstable
  //   commentersAsList: []; //unstable
  comments: Comment[];
  commentsClosed: boolean;
  dateCreated: string;
  dislikers: User[];
  dislikes: number;
  // entryCounter: null;
  firstComment?: Comment;
  id: number;
  imported: boolean;
  lastComment?: Comment;
  lastUpdated: string;
  likers: User[];
  // likersAsList: [];
  likes: number;
  linkCount?: number;
  links: EntryLink[];
  myPreference: MyPreference;
  origin?: Origin;
  providers: Recipient[];
  sender: User;
  text: string;
  totalComments: number;
  // type: null; ??
  visibility: Visibility;

  isHidden: boolean;
};

export const MyPreference = {
  none: 0,
  like: 1,
  dislike: -1,
} as const;

export type MyPreference = Values<typeof MyPreference>;

export type Preferences = {
  likes: number;
  dislikes: number;
  myPreference: MyPreference;
};

export type Origin = string | 'iPhone' | 'iPad' | 'Android';

export type Recipient = {
  address: string;
  class: 'it.senape.ff.dto.RecipientDto';
  fullName: string;
  id: number;
  name: string;
  ownerId: string;
  type: Uppercase<Visibility>;
};

export type Room = {
  id: number;
  admin?: boolean;
  avatar: string;
  inList?: boolean;
  locked?: boolean;
  silenced?: RoomStatus;
  subscribed?: boolean;
  name: string;
  title: string;
};

export const RoomStatus = {
  silenced: 'silenced',
  notSilenced: 'notSilenced',
} as const;

export type RoomStatus = Values<typeof RoomStatus>;

export type User = {
  avatarUrl?: string;
  class?: 'it.senape.ff.dto.UserDto';
  following?: boolean;
  fullName: string;
  id: number;
  locked?: boolean;
  username: string;
};

export const Visibility = {
  direct: 'direct',
  public: 'public',
} as const;

export type Visibility = Values<typeof Visibility>;
