const socket = io('ws://localhost:8080');

window.addEventListener('beforeunload', () => {
  localStorage.removeItem('AstroHuddle');
});

const huddleTitleElement = document.getElementById('huddle-title');
const huddleCodeElement = document.getElementById('huddle-code');
const messageInputElement = document.getElementById('message-input');
const sendMessageButton = document.getElementById('send-message-bttn');

const displayMessage = (username, message) => {
  const element = document.createElement('li');
  element.textContent = `${username == astroHuddleVars.username ? `${username} (You)` : username}: ${message}`;
  document.getElementById('messages-list').appendChild(element);
};

const astroHuddleVars = JSON.parse(localStorage.getItem('AstroHuddle'));
if (astroHuddleVars != null) {
  huddleTitleElement.innerHTML = `🌠 ${astroHuddleVars.huddle} Huddle`;

  socket.emit('message', JSON.stringify({ huddle: astroHuddleVars.huddle }));

  socket.on('message', (responseJSON) => {
    const response = JSON.parse(responseJSON);

    if ('history' in response) {
      for (const obj of response.history) {
        displayMessage(obj.username, obj.message);
      }
    } else if ('username' in response && 'message' in response) {
      displayMessage(response.username, response.message);
    }
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
  huddleTitleElement.innerHTML = `🌠 Unknown Huddle :(`;
  sendMessageButton.disabled = true;
}
