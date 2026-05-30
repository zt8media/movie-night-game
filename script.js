import { createHomeScene } from "./scenes/home.js";
import { createKitchenScene } from "./scenes/kitchen.js";
import { createRemoteScene } from "./scenes/remote.js";
import { createLoginScene } from "./scenes/login.js";
import { createMovieSelectScene } from "./scenes/movieSelect.js";
import { createEndingScene } from "./scenes/ending.js";
import { loadSave, resetSave, saveSettings, saveScene, getSettings } from "./save/saveManager.js";

const sceneRegistry = {
  home: createHomeScene,
  kitchen: createKitchenScene,
  remote: createRemoteScene,
  login: createLoginScene,
  movieSelect: createMovieSelectScene,
  ending: createEndingScene,
};

const app = document.querySelector("#app");
const backButton = document.querySelector("#back-button");
const settingsButton = document.querySelector("#settings-button");
const settingsPanel = document.querySelector("#settings-panel");
const resumeButton = document.querySelector("#resume-button");
const returnHomeButton = document.querySelector("#return-home-button");
const muteButton = document.querySelector("#mute-button");
const resetSaveButton = document.querySelector("#reset-save-button");

const state = {
  currentScene: "home",
  history: [],
  settingsOpen: false,
  settings: getSettings(),
};

function setMuteLabel() {
  muteButton.textContent = `Mute Music: ${state.settings.musicMuted ? "On" : "Off"}`;
}

function toggleSettings(forceOpen) {
  const open = typeof forceOpen === "boolean" ? forceOpen : !state.settingsOpen;
  state.settingsOpen = open;
  settingsPanel.classList.toggle("hidden", !open);
  settingsPanel.setAttribute("aria-hidden", String(!open));
}

function updateBackButton() {
  backButton.disabled = state.history.length === 0 || state.currentScene === "home";
}

function goToScene(sceneId, options = {}) {
  if (!sceneRegistry[sceneId]) {
    throw new Error(`Unknown scene: ${sceneId}`);
  }

  const { addToHistory = true, persist = true } = options;

  if (addToHistory && state.currentScene !== sceneId) {
    state.history.push(state.currentScene);
  }

  state.currentScene = sceneId;

  if (persist) {
    saveScene(sceneId);
  }

  renderScene();
}

function goBack() {
  const previousScene = state.history.pop();
  if (!previousScene) {
    return;
  }

  goToScene(previousScene, { addToHistory: false, persist: false });
}

function startNewGame() {
  state.history = [];
  goToScene("kitchen", { addToHistory: false, persist: true });
}

function continueGame() {
  const save = loadSave();
  state.history = [];
  goToScene(save.currentScene, { addToHistory: false, persist: false });
}

function returnHome() {
  state.history = [];
  toggleSettings(false);
  goToScene("home", { addToHistory: false, persist: false });
}

function handleSceneAction(action) {
  switch (action.type) {
    case "goto":
      goToScene(action.target);
      break;
    case "home":
      returnHome();
      break;
    case "newGame":
      startNewGame();
      break;
    case "continue":
      continueGame();
      break;
    case "settings":
      toggleSettings(true);
      break;
    default:
      break;
  }
}

function renderScene() {
  const sceneFactory = sceneRegistry[state.currentScene];
  const scene = sceneFactory({
    hasSave: loadSave().hasSave,
  });

  const actions = scene.actions
    .map(
      (action) =>
        `<button type="button" data-action="${action.type}" data-target="${action.target ?? ""}" ${action.disabled ? "disabled" : ""}>${action.label}</button>`,
    )
    .join("");

  app.innerHTML = `
    <section class="scene-card" style="background-image: linear-gradient(rgba(3, 9, 18, 0.25), rgba(3, 9, 18, 0.72)), url('${scene.background}')">
      <div class="scene-overlay">
        <h2>${scene.title}</h2>
        <p>${scene.text}</p>
        <div class="scene-actions">${actions}</div>
      </div>
    </section>
  `;

  app.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      handleSceneAction({
        type: button.dataset.action,
        target: button.dataset.target || undefined,
      });
    });
  });

  updateBackButton();
}

backButton.addEventListener("click", goBack);
settingsButton.addEventListener("click", () => toggleSettings());
resumeButton.addEventListener("click", () => toggleSettings(false));
returnHomeButton.addEventListener("click", returnHome);
muteButton.addEventListener("click", () => {
  state.settings.musicMuted = !state.settings.musicMuted;
  saveSettings(state.settings);
  setMuteLabel();
});
resetSaveButton.addEventListener("click", () => {
  resetSave();
  state.history = [];
  renderScene();
  toggleSettings(false);
});

setMuteLabel();

const save = loadSave();
if (save.hasSave && save.currentScene !== "home") {
  state.currentScene = save.currentScene;
}

renderScene();
