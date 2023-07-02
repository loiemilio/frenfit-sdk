import { decodeHTML } from 'entities';

import type { Room } from '@frenfit-types';
import { ffetch, frontendURL } from '@support/client';
import configuration from '@support/configuration';

import endpoints from './endpoints';

export default './endpoints';

export const displayRoomEntriesInHome = async (id: number) => {
  await ffetch(endpoints.toggleInHome(id, 'true'), {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  });
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

  const pieces = text.split('<input type="checkbox" name="show"');

  return pieces
    .map((block, index): Room => {
      if (index === 0) {
        [, block] = block.split('<div class="well clearfix">');
      }

      if (index === pieces.length - 1) {
        return {} as Room;
      }

      const nextBlock = pieces[index + 1];

      const admin = nextBlock.includes('/edit"');
      [, block] = block.split('<div class="span2"');

      const linkPattern = /<a\shref="\/(?<link>[^"]+)">/gm;
      const {
        groups: { link },
      } = linkPattern.exec(block) as unknown as { groups: { link: string } };
      const name = link.substring(configuration.earlyAdoptersPath.length);

      const avatarPattern = /src="\/?(?<avatar>[^"]+)"\salt="avatar"/gm;
      let {
        groups: { avatar },
      } = avatarPattern.exec(block) as unknown as { groups: { avatar: string } };
      avatar = avatar.startsWith(configuration.earlyAdoptersPath) ? frontendURL(avatar).href : avatar;

      const titlePattern = /<\/i>(?<title>.*)\s*/gm;
      const {
        groups: { title },
      } = titlePattern.exec(block) as unknown as { groups: { title: string } };

      const locked = block.includes('icon-lock');
      const inList = nextBlock.includes('checked');

      const idPattern = /updateSubscription\(&#39;(?<id>\d+)&/gm;
      const {
        groups: { id },
      } = idPattern.exec(nextBlock) as unknown as { groups: { id: string } };

      return {
        id: parseInt(id, 10),
        admin,
        avatar,
        inList,
        locked,
        name,
        title: decodeHTML(title.trim()),
      };
    })
    .filter(r => r.id);
};
