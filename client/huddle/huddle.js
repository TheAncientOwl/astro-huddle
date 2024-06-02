const socket = io('ws://localhost:8080');

const huddleTitleElement = document.getElementById('huddle-title');
const huddleCodeElement = document.getElementById('huddle-code');
const messageInputElement = document.getElementById('message-input');
const sendMessageButton = document.getElementById('send-message-bttn');

const displayMessage = (username, message) => {
  const element = document.createElement('li');
  element.textContent = `${username == astroHuddleVars.username ? 'YOU' : username}: ${message}`;
  document.getElementById('messages-list').appendChild(element);
};

// const hashString = async (str) => {
//   const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
//   const hashArray = Array.from(new Uint8Array(hashBuffer)).slice(0, 16);
//   const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
//   return hashHex.match(/.{1,4}/g).join('-');
// };

const astroHuddleVars = JSON.parse(localStorage.getItem('AstroHuddle'));
if (astroHuddleVars != null) {
  // hashString(astroHuddleVars.huddle).then((hash) => {
  //   astroHuddleVars.huddleHash = hash;
  //   huddleCodeElement.textContent = `Share code: ${astroHuddleVars.huddleHash}`;
  // });

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
  huddleTitleElement.innerHTML = 'No huddle :(';
  sendMessageButton.disabled = true;
}
