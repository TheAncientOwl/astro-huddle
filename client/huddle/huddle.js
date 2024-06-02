const AstroHuddleConfigKeys = {
  index: 'AstroHuddle_Index',
  huddle: 'AstroHuddle_Huddle',
};

document.getElementById('leave-huddle-bttn').onclick = () => {
  localStorage.removeItem(AstroHuddleConfigKeys.huddle);
};

const huddleTitleElement = document.getElementById('huddle-title');
const messageInputElement = document.getElementById('message-input');
const sendMessageButton = document.getElementById('send-message-bttn');

const displayMessage = (currentUsername, username, message) => {
  const element = document.createElement('li');
  element.textContent = `${username == currentUsername ? `${username} (You)` : username}: ${message}`;
  document.getElementById('messages-list').appendChild(element);
};

const sessionConfig = JSON.parse(localStorage.getItem(AstroHuddleConfigKeys.huddle));
if (sessionConfig != null) {
  const socket = io('ws://localhost:8080');

  huddleTitleElement.innerHTML = `🌠 ${sessionConfig.huddle} Huddle`;

  socket.emit('message', JSON.stringify({ huddle: sessionConfig.huddle }));

  socket.on('message', (responseJSON) => {
    const response = JSON.parse(responseJSON);

    if ('history' in response) {
      for (const obj of response.history) {
        displayMessage(sessionConfig.username, obj.username, obj.message);
      }
    } else if ('username' in response && 'message' in response) {
      displayMessage(sessionConfig.username, response.username, response.message);
    }
  });

  sendMessageButton.onclick = () => {
    socket.emit(
      'message',
      JSON.stringify({
        username: sessionConfig.username,
        huddle: sessionConfig.huddle,
        message: messageInputElement.value,
      })
    );

    messageInputElement.value = '';
  };
} else {
  huddleTitleElement.innerHTML = `🌠 Unknown Huddle :(`;
  sendMessageButton.disabled = true;
}
