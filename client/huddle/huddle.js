const socket = io('ws://localhost:8080');

const huddleTitleElement = document.getElementById('huddle-title');
const huddleCodeElement = document.getElementById('huddle-code');
const messageInputElement = document.getElementById('message-input');
const sendMessageButton = document.getElementById('send-message-bttn');

const displayMessage = (message) => {
  const element = document.createElement('li');
  element.textContent = message;
  document.getElementById('messages-list').appendChild(element);
};

const astroHuddleVars = JSON.parse(localStorage.getItem('AstroHuddle'));
if (astroHuddleVars != null) {
  // huddleCodeElement.textContent = `Share code: ${astroHuddleVars.huddle}`;

  huddleTitleElement.innerHTML = `🌠 ${astroHuddleVars.huddle} Huddle`;

  socket.emit('message', JSON.stringify({ huddle: astroHuddleVars.huddle }));

  socket.on('message', (messageJSON) => {
    const messageObj = JSON.parse(messageJSON);
    displayMessage(
      `${messageObj.username === astroHuddleVars.username ? 'You' : messageObj.username}: ${messageObj.message}`
    );
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
