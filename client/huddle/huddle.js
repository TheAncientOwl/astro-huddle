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

function formatTimeFromTimestamp(timestamp) {
  const date = new Date(timestamp);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // The hour '0' should be '12'
  const padZero = num => num.toString().padStart(2, '0');
  const formattedMinutes = padZero(minutes);

  return `${hours}:${formattedMinutes} ${ampm}`;
}

const displayMessage = (time, currentUsername, username, message, patch = false) => {
  const element = document.createElement('li');
  element.classList.add('astro-message');

  const name = document.createElement('div');
  name.classList.add('astro-message-name');

  const messageElement = document.createElement('div');
  messageElement.classList.add('astro-message-message');
  messageElement.textContent = message;

  const hour = document.createElement('div');
  hour.classList.add('astro-message-hour');
  hour.textContent = formatTimeFromTimestamp(time);

  for (const el of [name, messageElement, hour]) {
    element.appendChild(el);
  }

  if (username === currentUsername) {
    name.textContent = 'You';
    element.classList.add('is-current-user');
  } else {
    name.textContent = username;
  }

  const messagesListElement = document.getElementById('messages-list');

  if (patch === false) {
    messagesListElement.appendChild(element);
    element.scrollIntoView({ behavior: 'smooth' });
  } else {
    messagesListElement.insertBefore(element, messagesListElement.firstChild);
  }
};

const sessionConfig = JSON.parse(localStorage.getItem(AstroHuddleConfigKeys.huddle));
if (sessionConfig != null) {
  const socket = io('ws://localhost:8080');

  huddleTitleElement.innerHTML = `🌠 ${sessionConfig.huddle} Huddle`;

  socket.emit('message', JSON.stringify({ huddle: sessionConfig.huddle }));

  socket.on('message', responseJSON => {
    const response = JSON.parse(responseJSON);

    if ('history' in response) {
      for (const obj of response.history) {
        displayMessage(obj.time, sessionConfig.username, obj.username, obj.message);
      }
    } else if ('patchHistory' in response) {
      for (let index = response.patchHistory.length - 1; index >= 0; index--) {
        displayMessage(
          response.patchHistory[index].time,
          sessionConfig.username,
          response.patchHistory[index].username,
          response.patchHistory[index].message,
          true
        );
      }
    } else if ('username' in response && 'message' in response && 'time' in response) {
      displayMessage(response.time, sessionConfig.username, response.username, response.message);
    }
  });

  sendMessageButton.onclick = () => {
    if (messageInputElement.value.length != 0) {
      socket.emit(
        'message',
        JSON.stringify({
          username: sessionConfig.username,
          huddle: sessionConfig.huddle,
          message: messageInputElement.value,
          time: new Date().getTime(),
        })
      );

      messageInputElement.value = '';
    }
  };
} else {
  huddleTitleElement.innerHTML = `🌠 Unknown Huddle :(`;
  sendMessageButton.disabled = true;
}
