import { decodeHTML } from 'entities';

import type { Room } from '@frenfit-types';
import { ffetch, frontendURL } from '@support/client';
import configuration from '@support/configuration';

import endpoints from './endpoints';

export const searchRooms = async (query: string) => {
  const response = await ffetch(endpoints.search(query));
  const text = await response.text();

  const [, ...pieces] = text.split('<div class="span2 well well-small room">');

  return pieces.map((piece): Room => {
    const pattern = /data-action="(?<action>(un)?subscribe)"\s+data-id="(?<id>\d+)"/g;
    const match = pattern.exec(piece);
    if (!match?.groups?.id || !match?.groups?.action) {
      return {} as Room;
    }

    const imgPattern = /src="\/?(?<image>[^"]+)"/g;
    const {
      groups: { image },
    } = imgPattern.exec(piece) as unknown as { groups: { image: string } };
    const avatar = image.startsWith(configuration.earlyAdoptersPath) ? frontendURL(image).href : image;

    const namePatters = new RegExp(
      `<a href="/${configuration.earlyAdoptersPath}(?<name>[^"]+)">(?<title>[^<]+)</a>`,
      'g',
    );
    const {
      groups: { name, title },
    } = namePatters.exec(piece) as unknown as { groups: { title: string; name: string } };

    return {
      id: parseInt(match.groups.id, 10),
      avatar,
      name: decodeHTML(name),
      subscribed: match.groups.action === 'unsubscribe',
      title: decodeHTML(title),
    };
  });
};
