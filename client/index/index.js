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

const astroHuddleVars = JSON.parse(localStorage.getItem('AstroHuddle'));
if (astroHuddleVars != null) {
  console.log(astroHuddleVars);
  usernameInputElement.value = astroHuddleVars.username;
  huddleInputElement.value = astroHuddleVars.huddle;
  joinButton.disabled = !(astroHuddleVars.username.length !== 0 && astroHuddleVars.huddle.length !== 0);
} else {
  joinButton.disabled = true;
}

joinButton.onclick = () => {
  localStorage.setItem(
    'AstroHuddle',
    JSON.stringify({
      username: usernameInputElement.value,
      huddle: huddleInputElement.value,
    })
  );

  usernameInputElement.value = '';
  huddleInputElement.value = '';
};
