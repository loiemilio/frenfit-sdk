import { decodeHTML } from 'entities';

import type { Message, Recipient } from '@frenfit-types';
import { decodeComment } from '@sdk/comment';
import { decodeUser } from '@sdk/friend';

export const decodeEntry = (entry: Message): Message =>
  Object.assign({}, entry, {
    comments: (entry.comments || []).map(decodeComment),
    dislikers: (entry.dislikers || []).map(decodeUser),
    firstComment: entry.firstComment ? decodeComment(entry.firstComment) : undefined,
    lastComment: entry.lastComment ? decodeComment(entry.lastComment) : undefined,
    likers: (entry.likers || []).map(decodeUser),
    origin: entry.origin ? decodeHTML(entry.origin) : undefined,
    providers: entry.providers.map(decodeRecipient),
    sender: decodeUser(entry.sender),
    text: decodeHTML(entry.text),
  });

export const decodeRecipient = (recipient: Recipient) =>
  Object.assign({}, recipient, {
    fullName: decodeHTML(recipient.fullName),
  });
