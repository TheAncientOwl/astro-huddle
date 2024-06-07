class InputValidator {
  #usernameOK = false;
  #huddleOK = false;

  isOK = () => this.#usernameOK && this.#huddleOK;
  isNOK = () => !this.isOK();
  username = value => {
    this.#usernameOK = value.length !== 0;
    return this;
  };
  huddle = value => {
    this.#huddleOK = value.length !== 0;
    return this;
  };
}

const LocalStorageKeys = {
  data: 'AstroHuddle_Data',
};

const IndexVars = {
  sessionConfig: JSON.parse(localStorage.getItem(LocalStorageKeys.data)),
  validator: new InputValidator(),
  elements: {
    joinButton: undefined,
    username: undefined,
    huddle: undefined,
  },
};

const onDOMContentLoaded = () => {
  IndexVars.elements.joinButton = document.getElementById('join-huddle-bttn');
  IndexVars.elements.username = document.getElementById('username-input');
  IndexVars.elements.huddle = document.getElementById('huddle-input');

  if (IndexVars.sessionConfig != null) {
    const { username: usernameElement, huddle: huddleElement, joinButton } = IndexVars.elements;
    const { username, huddle } = IndexVars.sessionConfig;

    usernameElement.value = username;
    usernameElement.textContent = username;

    huddleElement.value = huddle;
    huddleElement.textContent = huddle;

    joinButton.disabled = IndexVars.validator.username(username).huddle(huddle).isNOK();
  } else {
    IndexVars.elements.joinButton.disabled = true;
  }

  const { username: usernameElement, huddle: huddleElement, joinButton } = IndexVars.elements;
  const { validator } = IndexVars;

  usernameElement.addEventListener(
    'input',
    () => (joinButton.disabled = validator.username(usernameElement.value).isNOK())
  );

  huddleElement.addEventListener('input', () => (joinButton.disabled = validator.huddle(huddleElement.value).isNOK()));

  joinButton.onclick = () =>
    localStorage.setItem(
      LocalStorageKeys.data,
      JSON.stringify({
        username: usernameElement.value,
        huddle: huddleElement.value,
      })
    );
};

window.addEventListener('DOMContentLoaded', onDOMContentLoaded);
