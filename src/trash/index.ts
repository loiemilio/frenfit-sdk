import { decodeHTML } from 'entities';

import { ffetch } from '@support/client';

import endpoints from './endpoints';
import type { TrashedItem } from './types';

export * from './actions';
export default './endpoints';

export const getTrashContent = async () => {
  const response = await ffetch(endpoints.trash);
  const text = await response.text();

  const [, ...pieces] = text.split('<div id="deleted_');

  return pieces.reduce(
    (result, piece) => {
      [piece] = piece.split('toggleSpinner');
      const idPattern = /^(entry|comment)_(?<id>\d+)"/g;
      const {
        groups: { id },
      } = idPattern.exec(piece) as unknown as { groups: { id: string } };

      console.log(piece);
      const contentPattern = /<(?<em>em)>(?<content>[\s\S]*)<\/em>/gm;
      const {
        groups: { content },
      } = contentPattern.exec(piece) as unknown as { groups: { content: string } };

      const item = {
        id: parseInt(id, 10),
        content: decodeHTML(content),
      } as TrashedItem;

      if (piece.startsWith('comment_')) {
        item.type = 'Comment';
        result.comments.push(item);
      }
      if (piece.startsWith('entry_')) {
        item.type = 'Message';
        result.entries.push(item);
      }

      return result;
    },
    { entries: [] as TrashedItem[], comments: [] as TrashedItem[] },
  );
};
