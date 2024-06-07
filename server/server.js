const {
  setupLunarDB,
  loadHuddleFromDB,
  insertHuddleIntoDB,
  updateHuddleHistoryDB,
  AstroDB_Config,
  Insert,
  Select,
} = require('./lunardb');

const lunardb = setupLunarDB();

const http = require('http').createServer();

const io = require('socket.io')(http, {
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
  console.log(`[INFO] A user has connected with following ID: ${socketID}`);

  socket.on('message', clientJSON => {
    console.log(`[MESSAGE-RECEIVED] Socket ${socketID} -> ${clientJSON}`);

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
                  const { _rid } = huddleData;

                  huddleToRID.set(huddle, _rid);
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
    connectedSockets.delete(socketID);
  });
});

http.listen(8080, () => console.log('[INFO] Listening on http://localhost:8080'));
