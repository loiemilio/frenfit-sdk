import { decodeHTML } from 'entities';

import type { Room } from '@frenfit-types';
import { ffetch, frontendURL } from '@support/client';
import configuration from '@support/configuration';
import { FrenfitException } from '@support/exceptions';

import { AddRoomRequest, EditRoomRequest } from './types';

export const sendRoomPageRequest = async (url: URL, request: AddRoomRequest | EditRoomRequest) => {
  const body = new URLSearchParams();
  if ('id' in request) {
    body.set('id', String(request.id));
  }
  body.set('username', request.username);
  body.set('fullName', request.title);
  body.set('avatarUrl', request.avatar || '');
  body.set('description', request.description || '');
  body.set('locked', request.locked ? 'on' : 'off');

  const response = await ffetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const text = await response.text();
  const pattern = /alert-error">\s+<ul><li>(?<error>[^<]+)<\/li>/gm;
  const match = pattern.exec(text);

  if (match?.groups?.error) {
    throw new FrenfitException('Unable to add new room', undefined, {
      error: match.groups.error,
    });
  }

  return text;
};

export const parseRoomsPage = (content: string) => {
  const pieces = content.split('<input type="checkbox" name="show"');

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
