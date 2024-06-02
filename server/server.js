const http = require('http').createServer();

const io = require('socket.io')(http, {
  cors: { origin: '*' },
});

io.on('connection', (socket) => {
  console.log('a user has connected');

  socket.on('message', (messageJSON) => {
    console.log(messageJSON);

    const messageObj = JSON.parse(messageJSON);

    socket.join(messageObj.huddle);
    io.emit('message', JSON.stringify({ username: messageObj.username, message: messageObj.message }));
    console.log(JSON.stringify({ username: messageObj.username, message: messageObj.message }));
  });
});

http.listen(8080, () => console.log('listening on http://localhost:8080'));
