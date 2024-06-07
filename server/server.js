import {
  setupLunarDB,
  loadHuddleFromDB,
  insertHuddleIntoDB,
  updateHuddleHistoryDB,
  Insert,
  Select,
} from './lunardb.js';

import { Logger, LogLevel } from './Logger.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

const lunardb = setupLunarDB();

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: { origin: '*' },
});

const messagesCache = new Map();
const huddleToRID = new Map();
const connectedSockets = new Set();

const minutesToMilliseconds = minutes => minutes * 60 * 1000;

setInterval(() => {
  for (const [huddleName, history] of messagesCache) {
    updateHuddleHistoryDB(huddleToRID.get(huddleName), history);
  }
}, minutesToMilliseconds(5));

io.on('connection', socket => {
  const socketID = socket.id;
  Logger.info(`SocketID(${socketID}) -> Connected`);

  socket.on('message', clientJSON => {
    Logger.info(`SocketID(${socketID}) -> Received message ${clientJSON}`);

    const request = JSON.parse(clientJSON);

    if (!('huddle' in request)) {
      return;
    }

    const { huddle } = request;

    socket.join(huddle);

    if (!connectedSockets.has(socketID)) {
      connectedSockets.add(socketID);

      if (messagesCache.has(huddle)) {
        io.to(socketID).emit('message', JSON.stringify({ history: messagesCache.get(huddle) }));
      } else {
        messagesCache.set(huddle, []);

        loadHuddleFromDB(huddle, huddlesData => {
          if (huddlesData.length === 0) {
            // huddle was not created before
            // 1. insert into DB
            insertHuddleIntoDB(huddle, [], () => {
              // 2. select to get the ID
              loadHuddleFromDB(huddle, huddlesData => {
                for (const huddleData of huddlesData) {
                  huddleToRID.set(huddle, huddleData._rid);
                }
              });
            });
          }
          // huddle exists, patch history
          else
            for (const huddleData of huddlesData) {
              const { _rid, history } = huddleData;

              huddleToRID.set(huddle, _rid);

              let historyFromDB = JSON.parse(history);
              historyFromDB.sort((a, b) => a.time - b.time);

              const currentMessages = messagesCache.get(huddle);
              io.to(socketID).emit('message', JSON.stringify({ patchHistory: historyFromDB }));

              historyFromDB.push(...currentMessages);
              messagesCache.set(huddle, historyFromDB);
            }
        });
      }
    }

    if ('username' in request && 'message' in request && 'time' in request) {
      const { username, message, time } = request;
      const messageObj = { username, message, time };

      io.to(huddle).emit('message', JSON.stringify(messageObj));

      messagesCache.get(huddle).push(messageObj);
    }
  });

  socket.on('disconnect', reason => {
    Logger.info(`SocketID(${socketID}) -> Disconnected`);
    connectedSockets.delete(socketID);
  });
});

httpServer.listen(8080, () => Logger.info(`Listening on https://localhost:8080`));
