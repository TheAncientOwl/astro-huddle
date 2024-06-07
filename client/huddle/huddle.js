const formatTimeFromTimestamp = timestamp => {
  const date = new Date(timestamp);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // The hour '0' should be '12'
  const formattedMinutes = minutes.toString().padStart(2, '0');

  return `${hours}:${formattedMinutes} ${ampm}`;
};

const LocalStorageKeys = {
  data: 'AstroHuddle_Data',
};

const HuddleVars = {
  sessionConfig: JSON.parse(localStorage.getItem(LocalStorageKeys.data)),
  socket: undefined,
  elements: {
    title: undefined,
    message: undefined,
    sendMessageButton: undefined,
    messagesList: undefined,
  },
};

const displayMessage = (time, currentUsername, username, message, patch = false) => {
  const createElement = (type, className, textContent = null) => {
    const element = document.createElement(type);
    element.classList.add(className);

    if (textContent != null) {
      element.textContent = textContent;
    }

    return element;
  };

  const isCurrentUser = username === currentUsername;

  const messageElement = createElement('li', 'astro-message');
  const usernameElement = createElement('div', 'astro-message-name', username);
  const textElement = createElement('div', 'astro-message-message', message);
  const hourElement = createElement('div', 'astro-message-hour', formatTimeFromTimestamp(time));

  if (username === currentUsername) {
    messageElement.classList.add('is-current-user');
    usernameElement.textContent = 'You';
  }

  for (const element of [usernameElement, textElement, hourElement]) {
    messageElement.appendChild(element);
  }

  if (patch === false) {
    HuddleVars.elements.messagesList.appendChild(messageElement);
    messageElement.scrollIntoView({ behavior: 'smooth' });
  } else {
    HuddleVars.elements.messagesList.insertBefore(messageElement, HuddleVars.elements.messagesList.firstChild);
  }
};

const handleHistory = ({ history }) => {
  for (const { time, username, message } of history) {
    displayMessage(time, HuddleVars.sessionConfig.username, username, message);
  }
};

const handlePatchHistory = ({ patchHistory }) => {
  for (let index = patchHistory.length - 1; index >= 0; index--) {
    displayMessage(
      patchHistory[index].time,
      HuddleVars.sessionConfig.username,
      patchHistory[index].username,
      patchHistory[index].message,
      true
    );
  }
};

const handleMessage = ({ time, username, message }) => {
  displayMessage(time, HuddleVars.sessionConfig.username, username, message);
};

const sendUserMessage = () => {
  const { message: messageElement } = HuddleVars.elements;
  const { socket } = HuddleVars;
  const { username, huddle } = HuddleVars.sessionConfig;

  if (messageElement.value.length != 0) {
    socket.emit(
      'message',
      JSON.stringify({
        username,
        huddle,
        message: messageElement.value,
        time: new Date().getTime(),
      })
    );

    messageElement.value = '';
  }
};

const onDOMContentLoaded = () => {
  HuddleVars.elements.title = document.getElementById('huddle-title');
  HuddleVars.elements.message = document.getElementById('message-input');
  HuddleVars.elements.sendMessageButton = document.getElementById('send-message-bttn');
  HuddleVars.elements.messagesList = document.getElementById('messages-list');

  if (HuddleVars.sessionConfig != null) {
    const { username, huddle } = HuddleVars.sessionConfig;
    const { sendMessageButton, message: messageElement, title: titleElement } = HuddleVars.elements;

    titleElement.innerHTML = `🌠 ${huddle} Huddle`;

    HuddleVars.socket = io('ws://localhost:8080');
    const { socket } = HuddleVars;

    socket.emit('message', JSON.stringify({ huddle }));

    socket.on('message', responseJSON => {
      const response = JSON.parse(responseJSON);
      if ('history' in response) {
        handleHistory(response);
      } else if ('patchHistory' in response) {
        handlePatchHistory(response);
      } else if ('username' in response && 'message' in response && 'time' in response) {
        handleMessage(response);
      } else {
        console.warn(`Received unknown response from server: ${responseJSON}`);
      }
    });

    sendMessageButton.onclick = sendUserMessage;
  } else {
    HuddleVars.elements.title.innerHTML = `🌠 Unknown Huddle :(`;
    HuddleVars.elements.sendMessageButton.disabled = true;
  }
};

window.addEventListener('DOMContentLoaded', onDOMContentLoaded);

document.addEventListener('keyup', ({ key }) => {
  if (key === 'Enter' && HuddleVars.elements.sendMessageButton.disabled === false) {
    sendUserMessage();
  }
});
