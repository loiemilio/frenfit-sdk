import { decodeHTML } from 'entities';

import type { Comment } from '@frenfit-types';

export const decodeComment = (comment: Comment): Comment =>
  Object.assign({}, comment, {
    origin: decodeHTML(comment.origin),
    text: decodeHTML(comment.text),
  });
