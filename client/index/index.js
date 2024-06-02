const AstroHuddleConfigKeys = {
  index: 'AstroHuddle_Index',
  huddle: 'AstroHuddle_Huddle',
};

const joinButton = document.getElementById('join-huddle-bttn');
const usernameInputElement = document.getElementById('username-input');
const huddleInputElement = document.getElementById('huddle-input');

let usernameOk = false;
let huddleOk = false;

usernameInputElement.addEventListener('input', () => {
  usernameOk = usernameInputElement.value.length !== 0;
  joinButton.disabled = !(usernameOk && huddleOk);
});

huddleInputElement.addEventListener('input', () => {
  huddleOk = huddleInputElement.value.length !== 0;
  joinButton.disabled = !(usernameOk && huddleOk);
});

const sessionConfig = JSON.parse(localStorage.getItem(AstroHuddleConfigKeys.index));
if (sessionConfig != null) {
  console.log('vars', sessionConfig);

  document.addEventListener('DOMContentLoaded', () => {
    usernameInputElement.value = sessionConfig.username;
    huddleInputElement.value = sessionConfig.huddle;

    joinButton.disabled = !(sessionConfig.username.length !== 0 && sessionConfig.huddle.length !== 0);
  });
} else {
  joinButton.disabled = true;
}

joinButton.onclick = () => {
  const setVars = (key) => {
    localStorage.setItem(
      key,
      JSON.stringify({
        username: usernameInputElement.value,
        huddle: huddleInputElement.value,
      })
    );
  };

  setVars(AstroHuddleConfigKeys.index);
  setVars(AstroHuddleConfigKeys.huddle);

  usernameInputElement.value = '';
  huddleInputElement.value = '';
};
