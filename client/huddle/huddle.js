const socket = io('ws://localhost:8080');

const huddleTitleElement = document.getElementById('huddle-title');
const messageInputElement = document.getElementById('message-input');
const sendMessageButton = document.getElementById('send-message-bttn');

const displayMessage = (message) => {
  const element = document.createElement('li');
  element.textContent = message;
  document.getElementById('messages-list').appendChild(element);
};

const astroHuddleVars = JSON.parse(localStorage.getItem('AstroHuddle'));
if (astroHuddleVars != null) {
  huddleTitleElement.innerHTML = `🌠 ${astroHuddleVars.huddle} Huddle`;

  socket.on('message', (messageJSON) => {
    const messageObj = JSON.parse(messageJSON.substr(3, messageJSON.length));
    displayMessage(`${messageObj.username}: ${messageObj.message}`);
  });

  sendMessageButton.onclick = () => {
    socket.emit(
      'message',
      JSON.stringify({
        username: astroHuddleVars.username,
        huddle: astroHuddleVars.huddle,
        message: messageInputElement.value,
      })
    );

    messageInputElement.value = '';
  };
} else {
  huddleTitleElement.innerHTML = 'No huddle :(';
  sendMessageButton.disabled = true;
}