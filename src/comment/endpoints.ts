import { frontendURL } from '@support/client';

export default {
  addComment: frontendURL('wbMessage/addComment'),
  dislikeComment: (id: number) => frontendURL('comment/dislike?id={id}', { id }),
  likeComment: (id: number) => frontendURL('comment/like?id={id}', { id }),
  removeComment: (id: number) => frontendURL('message/remove?id={id}', { id }),
};
