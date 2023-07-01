import fs from 'fs/promises';

import fetchMock from 'fetch-mock';
import { Liquid } from 'liquidjs';

import { Message } from '@frenfit-types';
import { setAuthCookies } from '@sdk/auth';
import { AddEntryRequest, deleteEntry, editEntry, getEntry, listRecipients, postEntry } from '@sdk/feed';
import endpoints from '@sdk/feed/endpoints';
import { FrenfitException, UnexpectedResponseException } from '@sdk/support/exceptions';
import { initContext, mockFrenfitResponse, randomString } from '@test/support/utils';

const context = initContext<{
  engine: Liquid;
}>();

beforeAll(() => {
  context.engine = new Liquid();
});

const mockPostEntry = async (request: Partial<AddEntryRequest> = {}) => {
  const id = Math.ceil(Math.random() * 1000);
  request.message ||= request.message || randomString();
  const response = context.engine.renderFile('./test/fixtures/entry.html', {
    id,
    content: request.message,
    date: '2 hours ago',
  });

  fetchMock.post(endpoints.postEntry.toString(), response, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

  const entryJson = context.engine.renderFile('./test/fixtures/entry.json', {
    entryId: id,
    entryContent: request.message,
  });
  fetchMock.get(endpoints.entry(id).toString(), entryJson);

  const entry = await postEntry({
    message: request.message,
    files: request.files,
    recipientIds: request.recipientIds,
  });

  expect(fetchMock.calls()).toHaveLength(2);
  const body = fetchMock.calls()[0][1].body;
  expect(body).toBeInstanceOf(FormData);
  expect((body as FormData).get('message')).toEqual(request.message);

  expect(entry.id).toEqual(id);
  expect(entry.text).toEqual(request.message);

  return { body, entry } as { body: FormData; entry: Message };
};

describe('entries', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  beforeEach(() => {
    setAuthCookies(randomString(), randomString());
  });

  it('can not create an entry with empty content', async () => {
    fetchMock.post(endpoints.postEntry.toString(), '<invalid response>', {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    const action = async () =>
      await postEntry({
        message: '',
      });

    await expect(action).rejects.toThrow(UnexpectedResponseException);
  });

  it('can create an entry', async () => {
    await mockPostEntry();
  });

  it('can get an entry', async () => {
    const id = Math.ceil(Math.random() * 1000);
    const entryContent = randomString();
    const entryJson = context.engine.renderFile('./test/fixtures/entry.json', {
      entryId: id,
      entryContent,
    });

    fetchMock.get(endpoints.entry(id).toString(), entryJson);

    const message = await getEntry(id, { checkIfBookmarked: false });

    expect(message.text).toStrictEqual(entryContent);
  });

  it('can edit an entry', async () => {
    const {
      entry: { id },
    } = await mockPostEntry();
    const newMessage = randomString();

    fetchMock.post(
      endpoints.editEntry.toString(),
      mockFrenfitResponse({
        status: 200,
        body: newMessage,
      }),
    );

    const entryJson = context.engine.renderFile('./test/fixtures/entry.json', {
      entryId: id,
      entryContent: newMessage,
    });

    fetchMock.get(endpoints.entry(id).toString(), entryJson, {
      overwriteRoutes: true,
    });

    const message = await editEntry(id, { message: newMessage }, { checkIfBookmarked: false });

    expect(message.text).toStrictEqual(newMessage);
  });

  it('can not create an entry with unsupported attachments', async () => {
    const type = 'application/json';
    const invalidFile = new File([], 'invalid.json', { type });

    const action = async () => {
      try {
        await mockPostEntry({ files: [invalidFile] });
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toEqual(`Invalid file type ${type}`);
        throw e;
      }
    };

    await expect(action).rejects.toThrow(FrenfitException);
  });

  it('can not find possible recipients in invalid feed page', async () => {
    const feedPage = context.engine.renderFile('./test/fixtures/entries.html', {
      id: 1000,
      flwz: 'undefined',
    });

    fetchMock.get(endpoints.emptyRoom.toString(), feedPage);

    const action = async () => {
      await listRecipients();
    };

    await expect(action).rejects.toThrow(UnexpectedResponseException);
  });

  it('can find possible recipients in feed page', async () => {
    const flwz = Array.from({ length: Math.ceil(Math.random() * 10) }, () => ({
      id: Math.ceil(Math.random() * 1000),
      name: randomString(),
      fullname: randomString(),
      isRoom: Math.random() < 0.3,
    }));

    const feedPage = context.engine.renderFile('./test/fixtures/entries.html', {
      id: 1000,
      flwz: JSON.stringify(
        Object.fromEntries(flwz.map(r => [`${r.isRoom ? '<i>' : ''}${r.fullname} (${r.name})`, r.id])),
      ),
    });

    fetchMock.get(endpoints.emptyRoom.toString(), feedPage);

    const recipients = await listRecipients();
    expect(recipients).toHaveLength(flwz.length);
    expect(recipients).toEqual(flwz);
  });

  it('can create an entry with recipients', async () => {
    const recipientIds = Array.from({ length: Math.ceil(Math.random() * 10) }, () => Math.ceil(Math.random() * 1000));
    const { body } = await mockPostEntry({ recipientIds: recipientIds });

    const rcptIds = body.getAll('rcptId');
    expect(rcptIds).toStrictEqual(recipientIds.map(i => i.toString()));
  });

  it('can create an entry with attachments', async () => {
    const fileName = 'dummy.jpg';
    const buffer = await fs.readFile('./test/fixtures/friday-live.jpg');
    const file = new File([buffer], fileName, { type: 'image/jpeg' });

    const emptyFileName = 'empty.png';
    const emptyFile = new File([], emptyFileName, { type: 'image/png' });

    const { body } = await mockPostEntry({ files: [file, emptyFile] });

    const files = body.getAll('filesToUpload');
    expect(files).toHaveLength(2);

    expect(files[0]).toBeInstanceOf(File);
    expect((files[0] as File).name).toEqual(fileName);
    expect((files[0] as File).size).toEqual(file.size);

    expect(files[1]).toBeInstanceOf(File);
    expect((files[1] as File).name).toEqual(emptyFileName);
    expect((files[1] as File).size).toEqual(0);
  });

  it('can delete an entry', async () => {
    const id = Math.ceil(Math.random() * 1000);
    fetchMock.get(endpoints.deleteEntry(id).toString(), 200, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    await deleteEntry(id);

    expect(fetchMock.calls()).toHaveLength(1);
  });
});
