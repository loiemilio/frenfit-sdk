import { ffetch } from '@support/client';
import { UnexpectedResponseException } from '@support/exceptions';

import endpoints from './endpoints';
import type { TargetFeed } from './types';

export const listRecipients = async () => {
  const emptyRoomResponse = await ffetch(endpoints.emptyRoom);
  const pageContent = await emptyRoomResponse.text();

  const pattern = /var\s+flwz\s*=\s*(?<recipients>\{[^}]+\});+/gm;
  const match = pattern.exec(pageContent);
  if (!match?.groups?.recipients) {
    throw new UnexpectedResponseException(emptyRoomResponse, {
      reason: 'Page does not contain flwz list',
    });
  }

  const recipients = JSON.parse(match.groups.recipients) as Record<string, number>;

  return Object.entries(recipients).map(([name, id]) => {
    const pattern = /^(?<isRoom><i>)?(?<fullname>.*)\s+\((?<name>[^)]+)\s*\)/;
    const match = pattern.exec(name);

    return {
      id,
      name: match?.groups?.name,
      fullname: match?.groups?.fullname,
      isRoom: !!match?.groups?.isRoom,
    } as TargetFeed;
  });
};
