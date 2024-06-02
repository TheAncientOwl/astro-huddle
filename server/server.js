const http = require('http').createServer();

const io = require('socket.io')(http, {
  cors: { origin: '*' },
});

io.on('connection', (socket) => {
  console.log(`[INFO] A user has connected with following ID: ${socket.id}`);

  socket.on('message', (messageJSON) => {
    console.log(`[MESSAGE] Socket ${socket.id} -> ${messageJSON}`);

    const messageObj = JSON.parse(messageJSON);

    if ('huddle' in messageObj) {
      socket.join(messageObj.huddle);

      if ('username' in messageObj && 'message' in messageObj) {
        io.to(messageObj.huddle).emit(
          'message',
          JSON.stringify({ username: messageObj.username, message: messageObj.message })
        );
      }
    }
  });
});

http.listen(8080, () => console.log('listening on http://localhost:8080'));
