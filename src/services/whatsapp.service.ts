import { Boom } from '@hapi/boom';
import NodeCache from 'node-cache';
import readline from 'readline';
import makeWASocket, {
  AnyMessageContent,
  BinaryInfo,
  delay,
  DisconnectReason,
  encodeWAM,
  fetchLatestBaileysVersion,
  getAggregateVotesInPollMessage,
  makeCacheableSignalKeyStore,
  makeInMemoryStore,
  PHONENUMBER_MCC,
  proto,
  useMultiFileAuthState,
  WAMessageContent,
  WAMessageKey,
} from '@whiskeysockets/baileys';
import MAIN_LOGGER from '../utils/logger';
import open from 'open';
import fs from 'fs';

// start a connection
var sock: ReturnType<typeof makeWASocket> | undefined;

export const startSock2 = async () => {
  const logger = MAIN_LOGGER.child({});
  logger.level = 'error';

  const useStore = !process.argv.includes('--no-store');
  const doReplies = !process.argv.includes('--no-reply');
  const usePairingCode = process.argv.includes('--use-pairing-code');
  const useMobile = process.argv.includes('--mobile');

  // external map to store retry counts of messages when decryption/encryption fails
  // keep this out of the socket itself, so as to prevent a message decryption/encryption loop across socket restarts
  const msgRetryCounterCache = new NodeCache();

  // Read line interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const question = (text: string) =>
    new Promise<string>((resolve) => rl.question(text, resolve));

  // the store maintains the data of the WA connection in memory
  // can be written out to a file & read from it
  const store = useStore ? makeInMemoryStore({ logger }) : undefined;
  store?.readFromFile('./baileys_store_multi.json');
  // save every 10s
  setInterval(() => {
    store?.writeToFile('./baileys_store_multi.json');
  }, 10_000);
  const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info');
  // fetch latest version of WA Web
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`);

  sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: true,
    mobile: useMobile,
    auth: {
      creds: state.creds,
      /** caching makes the store faster to send/recv messages */
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    msgRetryCounterCache,
    generateHighQualityLinkPreview: true,
    // ignore all broadcast messages -- to receive the same
    // comment the line below out
    // shouldIgnoreJid: jid => isJidBroadcast(jid),
    // implement to handle retries & poll updates
    getMessage,
  });

  async function getMessage(
    key: WAMessageKey
  ): Promise<WAMessageContent | undefined> {
    if (store) {
      const msg = await store.loadMessage(key.remoteJid!, key.id!);
      return msg?.message || undefined;
    }

    // only if store is present
    return proto.Message.fromObject({});
  }

  sock.ev.on('messages.upsert', ({ messages }) => {
    console.log('got messages', messages);
  });

  return sock;
};

export const sendMessageTyping = async (
  msg: AnyMessageContent,
  jid: string
) => {
  if (!sock) {
    throw new Error('WhatsApp not initialized');
  }

  await sock.presenceSubscribe(jid);
  await delay(500);

  await sock.sendPresenceUpdate('composing', jid);
  await delay(2000);

  await sock.sendPresenceUpdate('paused', jid);

  await sock.sendMessage(jid, msg);
};

export const startSock = async () => {
  const logger = MAIN_LOGGER.child({});
  logger.level = 'error';

  const useStore = !process.argv.includes('--no-store');
  const doReplies = !process.argv.includes('--no-reply');
  const usePairingCode = process.argv.includes('--use-pairing-code');
  const useMobile = process.argv.includes('--mobile');

  // external map to store retry counts of messages when decryption/encryption fails
  // keep this out of the socket itself, so as to prevent a message decryption/encryption loop across socket restarts
  const msgRetryCounterCache = new NodeCache();

  // Read line interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const question = (text: string) =>
    new Promise<string>((resolve) => rl.question(text, resolve));

  // the store maintains the data of the WA connection in memory
  // can be written out to a file & read from it
  const store = useStore ? makeInMemoryStore({ logger }) : undefined;
  store?.readFromFile('./baileys_store_multi.json');
  // save every 10s
  setInterval(() => {
    store?.writeToFile('./baileys_store_multi.json');
  }, 10_000);
  const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info');
  // fetch latest version of WA Web
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`);

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: true,
    mobile: useMobile,
    auth: {
      creds: state.creds,
      /** caching makes the store faster to send/recv messages */
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    msgRetryCounterCache,
    generateHighQualityLinkPreview: true,
    // ignore all broadcast messages -- to receive the same
    // comment the line below out
    // shouldIgnoreJid: jid => isJidBroadcast(jid),
    // implement to handle retries & poll updates
    getMessage,
  });

  async function getMessage(
    key: WAMessageKey
  ): Promise<WAMessageContent | undefined> {
    if (store) {
      const msg = await store.loadMessage(key.remoteJid!, key.id!);
      return msg?.message || undefined;
    }

    // only if store is present
    return proto.Message.fromObject({});
  }

  const sendMessageWTyping = async (msg: AnyMessageContent, jid: string) => {
    await sock.presenceSubscribe(jid);
    await delay(500);

    await sock.sendPresenceUpdate('composing', jid);
    await delay(2000);

    await sock.sendPresenceUpdate('paused', jid);

    await sock.sendMessage(jid, msg);
  };

  sock.ev.process(
    // events is a map for event name => event data
    async (events) => {
      // something about the connection changed
      // maybe it closed, or we received all offline message or connection opened
      if (events['connection.update']) {
        const update = events['connection.update'];
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
          // reconnect if not logged out
          if (
            (lastDisconnect?.error as Boom)?.output?.statusCode !==
            DisconnectReason.loggedOut
          ) {
            startSock();
          } else {
            console.log('Connection closed. You are logged out.');
          }
        }

        // WARNING: THIS WILL SEND A WAM EXAMPLE AND THIS IS A ****CAPTURED MESSAGE.****
        // DO NOT ACTUALLY ENABLE THIS UNLESS YOU MODIFIED THE FILE.JSON!!!!!
        // THE ANALYTICS IN THE FILE ARE OLD. DO NOT USE THEM.
        // YOUR APP SHOULD HAVE GLOBALS AND ANALYTICS ACCURATE TO TIME, DATE AND THE SESSION
        // THIS FILE.JSON APPROACH IS JUST AN APPROACH I USED, BE FREE TO DO THIS IN ANOTHER WAY.
        // THE FIRST EVENT CONTAINS THE CONSTANT GLOBALS, EXCEPT THE seqenceNumber(in the event) and commitTime
        // THIS INCLUDES STUFF LIKE ocVersion WHICH IS CRUCIAL FOR THE PREVENTION OF THE WARNING
        const sendWAMExample = false;
        if (connection === 'open' && sendWAMExample) {
          /// sending WAM EXAMPLE
          const {
            header: { wamVersion, eventSequenceNumber },
            events,
          } = JSON.parse(
            await fs.promises.readFile('./boot_analytics_test.json', 'utf-8')
          );

          const binaryInfo = new BinaryInfo({
            protocolVersion: wamVersion,
            sequence: eventSequenceNumber,
            events: events,
          });

          const buffer = encodeWAM(binaryInfo);

          const result = await sock.sendWAMBuffer(buffer);
          console.log(result);
        }

        console.log('connection update', update);
      }

      // credentials updated -- save them
      if (events['creds.update']) {
        await saveCreds();
      }

      if (events['labels.association']) {
        console.log(events['labels.association']);
      }

      if (events['labels.edit']) {
        console.log(events['labels.edit']);
      }

      if (events.call) {
        console.log('recv call event', events.call);
      }

      // history received
      if (events['messaging-history.set']) {
        const { chats, contacts, messages, isLatest } =
          events['messaging-history.set'];
        console.log(
          `recv ${chats.length} chats, ${contacts.length} contacts, ${messages.length} msgs (is latest: ${isLatest})`
        );
      }

      // received a new message
      if (events['messages.upsert']) {
        const upsert = events['messages.upsert'];
        console.log('recv messages ', JSON.stringify(upsert, undefined, 2));

        if (upsert.type === 'notify') {
          for (const msg of upsert.messages) {
            if (!msg.key.fromMe && doReplies) {
              console.log('replying to', msg.key.remoteJid);
              await sock!.readMessages([msg.key]);
              await sendMessageWTyping(
                { text: 'Bem Vindo ao Artistic Trivia!' },
                msg.key.remoteJid!
              );
            }
          }
        }
      }

      // messages updated like status delivered, message deleted etc.
      if (events['messages.update']) {
        console.log(JSON.stringify(events['messages.update'], undefined, 2));

        for (const { key, update } of events['messages.update']) {
          if (update.pollUpdates) {
            const pollCreation = await getMessage(key);
            if (pollCreation) {
              console.log(
                'got poll update, aggregation: ',
                getAggregateVotesInPollMessage({
                  message: pollCreation,
                  pollUpdates: update.pollUpdates,
                })
              );
            }
          }
        }
      }

      if (events['message-receipt.update']) {
        console.log(events['message-receipt.update']);
      }

      if (events['messages.reaction']) {
        console.log(events['messages.reaction']);
      }

      if (events['presence.update']) {
        console.log(events['presence.update']);
      }

      if (events['chats.update']) {
        console.log(events['chats.update']);
      }

      if (events['contacts.update']) {
        for (const contact of events['contacts.update']) {
          if (typeof contact.imgUrl !== 'undefined') {
            const newUrl =
              contact.imgUrl === null
                ? null
                : await sock!.profilePictureUrl(contact.id!).catch(() => null);
            console.log(
              `contact ${contact.id} has a new profile pic: ${newUrl}`
            );
          }
        }
      }

      if (events['chats.delete']) {
        console.log('chats deleted ', events['chats.delete']);
      }
    }
  );
};
