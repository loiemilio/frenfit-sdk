import { decodeHTML } from 'entities';

import type { Comment } from '@frenfit-types';
import { decodeUser } from '@sdk/friend';

export const decodeComment = (comment: Comment): Comment =>
  Object.assign({}, comment, {
    dislikers: (comment.dislikers || []).map(decodeUser),
    likers: (comment.likers || []).map(decodeUser),
    origin: comment.origin ? decodeHTML(comment.origin) : undefined,
    sender: decodeUser(comment.sender),
    text: decodeHTML(comment.text),
  });
