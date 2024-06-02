const socket = io('ws://localhost:8080');

socket.on('message', (text) => {
  const element = document.createElement('li');
  element.innerHTML = text;
  document.querySelector('ul').appendChild(element);
});

document.querySelector('button').onclick = () => {
  const text = document.querySelector('input').value;
  socket.emit('message', text);
};
