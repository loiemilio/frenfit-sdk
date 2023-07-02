import { decodeHTML } from 'entities';

import { decodeUser } from '@sdk/friend';
import { Comment } from 'src/types';

export const decodeComment = (comment: Comment): Comment =>
  Object.assign({}, comment, {
    dislikers: (comment.dislikers || []).map(decodeUser),
    likers: (comment.likers || []).map(decodeUser),
    origin: decodeHTML(comment.origin),
    sender: decodeUser(comment.sender),
    text: decodeHTML(comment.text),
  });
