import { decodeHTML } from 'entities';

import type { Message, Recipient } from '@frenfit-types';
import { decodeComment } from '@sdk/comment';

export const decodeEntry = (entry: Message): Message =>
  Object.assign({}, entry, {
    comments: (entry.comments || []).map(decodeComment),
    firstComment: entry.firstComment ? decodeComment(entry.firstComment) : undefined,
    lastComment: entry.lastComment ? decodeComment(entry.lastComment) : undefined,
    origin: entry.origin ? decodeHTML(entry.origin) : undefined,
    providers: entry.providers.map(decodeRecipient),
    text: decodeHTML(entry.text),
  });

export const decodeRecipient = (recipient: Recipient) =>
  Object.assign({}, recipient, {
    fullName: decodeHTML(recipient.fullName),
  });
