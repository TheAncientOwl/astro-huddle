const http = require('http').createServer();

const io = require('socket.io')(http, {
  cors: { origin: '*' },
});

const messagesCache = new Map();
const connectedSockets = new Set();

io.on('connection', (socket) => {
  console.log(`[INFO] A user has connected with following ID: ${socket.id}`);

  socket.on('message', (clientJSON) => {
    console.log(`[MESSAGE] Socket ${socket.id} -> ${clientJSON}`);

    const request = JSON.parse(clientJSON);

    if ('huddle' in request) {
      socket.join(request.huddle);

      if (!connectedSockets.has(socket.id)) {
        connectedSockets.add(socket.id);

        if (messagesCache.has(request.huddle)) {
          io.to(socket.id).emit('message', JSON.stringify({ history: messagesCache.get(request.huddle) }));
        } else {
          messagesCache.set(request.huddle, []);
        }
      }

      if ('username' in request && 'message' in request) {
        const message = { username: request.username, message: request.message };
        io.to(request.huddle).emit('message', JSON.stringify(message));
        messagesCache.get(request.huddle).push(message);
      }
    }
  });

  socket.on('disconnect', (reason) => {
    connectedSockets.delete(socket.id);
  });
});

http.listen(8080, () => console.log('[INFO] Listening on http://localhost:8080'));
