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
const resumeAppButton = document.querySelector("#resume-app-button");
const returnHomeButton = document.querySelector("#return-home-button");
const muteButton = document.querySelector("#mute-button");
const volumeSlider = document.querySelector("#volume-slider");
const volumeValue = document.querySelector("#volume-value");
const resetSaveButton = document.querySelector("#reset-save-button");
const notesOpenButton = document.querySelector("#notes-open-button");
const spotifyOpenButton = document.querySelector("#spotify-open-button");
const phoneBackButton = document.querySelector("#phone-back-button");
const phoneTitle = document.querySelector("#phone-title");
const phoneHomeView = document.querySelector("#phone-home-view");
const phoneNotesView = document.querySelector("#phone-notes-view");
const phoneSpotifyView = document.querySelector("#phone-spotify-view");
const phoneNoteTitle = document.querySelector("#phone-note-title");
const phoneNoteContent = document.querySelector("#phone-note-content");
const spotifyNowPlaying = document.querySelector("#spotify-now-playing");
const spotifyPlaylist = document.querySelector("#spotify-playlist");
const orientationOverlay = document.querySelector("#orientation-overlay");
const bgMusic = document.querySelector("#bg-music");

const notesContent = {
  grocery: {
    title: "Grocery List",
    items: [
      "Gluten-free pasta",
      "Marinara sauce",
      "Garlic",
      "Parmesan",
      "Cat treats",
      "Popcorn",
      "Sparkling water",
      "Strawberries",
      "Rice crackers",
      "Salmon",
      "Shrimp",
      "Seaweed snacks",
      "Gluten-free bread",
      "Dairy-free ice cream",
      "Lemonade",
      "Extra napkins",
    ],
  },
  movies: {
    title: "Movies To Watch",
    items: [
      "Arcane",
      "Twilight",
      "Prince of Egypt",
      "New Moon",
      "Invincible",
      "Drag Race",
      "Watch Me Play Resident Evil",
      "Prince of Egypt again",
      "Studio Ghibli movie",
      "Wicked",
      "Maybe Ponyo",
    ],
  },
  passwords: {
    title: "Passwords",
    items: [
      "Pizza App — extraCheese42",
      "Cat Food Club — tunaTunaTuna",
      "Weather — whyIsItRainingAgain",
      "Coffee Rewards — needMoreCoffee",
      "Movie Tracker — teamEdwardDontJudge",
      "Shopping — iSwearThisWasOnSale",
      "Recipe Site — garlicBreadForever",
      "Streaming Service — imsorry67",
      "Pet Camera — stopEatingThePlant",
      "Music App — skipThisSong",
      "Email — definitelyNotThePassword",
      "Food Delivery — friesBeforeGuys",
      "Calendar — whatDayIsIt",
      "Cloud Storage — doNotDeleteThis",
      "WiFi — askTheCat",
    ],
  },
};

const spotifySongs = [
  "Decode — Paramore",
  "Supermassive Black Hole — Muse",
  "Flightless Bird, American Mouth — Iron & Wine",
  "Roslyn — Bon Iver & St. Vincent",
  "Sea of Love — Cat Power",
  "First Love/Late Spring — Mitski",
  "Pink in the Night — Mitski",
  "Space Song — Beach House",
  "Sweet — Cigarettes After Sex",
  "My Love Mine All Mine — Mitski",
];

const state = {
  currentScene: "home",
  history: [],
  settingsOpen: false,
  settings: getSettings(),
  phoneView: "home",
  selectedNote: "grocery",
  selectedSong: "",
};

function clampVolume(value) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return 0.45;
  }
  return Math.min(1, Math.max(0, parsed));
}

state.settings.musicVolume = clampVolume(state.settings.musicVolume);

function setMuteLabel() {
  muteButton.innerHTML = `<span class="phone-app-icon">${state.settings.musicMuted ? "🔇" : "🔊"}</span><span class="phone-app-label">Music: ${state.settings.musicMuted ? "Off" : "On"}</span>`;
}

function setVolumeLabel() {
  if (!volumeSlider || !volumeValue) {
    return;
  }
  const volumePercent = Math.round(clampVolume(state.settings.musicVolume) * 100);
  volumeSlider.value = String(volumePercent);
  volumeValue.textContent = `${volumePercent}%`;
}

function tryStartMusic() {
  if (!bgMusic || state.settings.musicMuted) {
    return;
  }
  bgMusic
    .play()
    .catch(() => {
      // Autoplay can fail until user interaction; safe to ignore.
    });
}

function syncMusicState() {
  if (!bgMusic) {
    return;
  }

  bgMusic.volume = clampVolume(state.settings.musicVolume);
  bgMusic.muted = Boolean(state.settings.musicMuted);

  if (state.settings.musicMuted) {
    bgMusic.pause();
    return;
  }

  tryStartMusic();
}

function renderPhoneNote() {
  const note = notesContent[state.selectedNote];
  phoneNoteTitle.textContent = note.title;

  document.querySelectorAll("[data-phone-note]").forEach((button) => {
    button.classList.toggle("notes-note-active", button.dataset.phoneNote === state.selectedNote);
  });

  if (state.selectedNote === "passwords") {
    phoneNoteContent.innerHTML = `
      <div class="password-note-scroll">
        ${note.items.map((item) => `<p>${item}</p>`).join("")}
      </div>
    `;
    return;
  }

  phoneNoteContent.innerHTML = `
    <ul class="note-listing">
      ${note.items.map((item) => `<li>${item}</li>`).join("")}
    </ul>
  `;
}

function renderSpotifyPlaylist() {
  spotifyPlaylist.innerHTML = spotifySongs
    .map(
      (song, index) => `
        <li>
          <button type="button" class="spotify-track-button" data-spotify-song="${song}">
            <span class="spotify-track-number">${index + 1}.</span>
            <span>${song}</span>
          </button>
        </li>
      `,
    )
    .join("");

  spotifyNowPlaying.textContent = state.selectedSong
    ? `Now pretending to play: ${state.selectedSong}`
    : "Now pretending to play: nothing yet";

  spotifyPlaylist.querySelectorAll("[data-spotify-song]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedSong = button.dataset.spotifySong;
      spotifyNowPlaying.textContent = `Now pretending to play: ${state.selectedSong}`;
    });
  });
}

function renderPhoneView() {
  const notesMode = state.phoneView === "notes";
  const spotifyMode = state.phoneView === "spotify";
  phoneHomeView.classList.toggle("hidden", notesMode || spotifyMode);
  phoneNotesView.classList.toggle("hidden", !notesMode);
  phoneSpotifyView.classList.toggle("hidden", !spotifyMode);
  phoneBackButton.classList.toggle("hidden", !(notesMode || spotifyMode));
  phoneTitle.textContent = notesMode ? "Notes" : spotifyMode ? "Spotify" : "Phone";

  if (notesMode) {
    renderPhoneNote();
  }

  if (spotifyMode) {
    renderSpotifyPlaylist();
  }
}

function updateOrientationGate() {
  const isPortrait = window.matchMedia("(orientation: portrait)").matches;
  const likelyMobileOrTablet =
    window.matchMedia("(pointer: coarse)").matches ||
    navigator.maxTouchPoints > 0 ||
    window.innerWidth <= 1024;
  const shouldBlock = isPortrait && likelyMobileOrTablet;

  orientationOverlay.classList.toggle("hidden", !shouldBlock);
  orientationOverlay.setAttribute("aria-hidden", String(!shouldBlock));
}

function toggleSettings(forceOpen) {
  const open = typeof forceOpen === "boolean" ? forceOpen : !state.settingsOpen;
  state.settingsOpen = open;
  if (open) {
    state.phoneView = "home";
  }
  settingsPanel.classList.toggle("hidden", !open);
  settingsPanel.setAttribute("aria-hidden", String(!open));
  renderPhoneView();
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
  resetSave();
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
  const save = loadSave();
  const scene = sceneFactory({
    hasSave: save.hasSave,
    save,
  });

  if (scene.render) {
    app.innerHTML = scene.render();
  } else {
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
  }

  app.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      handleSceneAction({
        type: button.dataset.action,
        target: button.dataset.target || undefined,
      });
    });
  });

  if (scene.setup) {
    scene.setup({
      app,
      goToScene,
      renderScene,
    });
  }

  updateBackButton();
}

backButton.addEventListener("click", goBack);
settingsButton.addEventListener("click", () => toggleSettings());
resumeButton.addEventListener("click", () => toggleSettings(false));
resumeAppButton.addEventListener("click", () => toggleSettings(false));
returnHomeButton.addEventListener("click", returnHome);
notesOpenButton.addEventListener("click", () => {
  state.phoneView = "notes";
  renderPhoneView();
});
spotifyOpenButton.addEventListener("click", () => {
  state.phoneView = "spotify";
  renderPhoneView();
});
phoneBackButton.addEventListener("click", () => {
  state.phoneView = "home";
  renderPhoneView();
});
document.querySelectorAll("[data-phone-note]").forEach((button) => {
  button.addEventListener("click", () => {
    state.selectedNote = button.dataset.phoneNote;
    renderPhoneNote();
  });
});
muteButton.addEventListener("click", () => {
  state.settings.musicMuted = !state.settings.musicMuted;
  saveSettings(state.settings);
  setMuteLabel();
  syncMusicState();
});
volumeSlider?.addEventListener("input", () => {
  state.settings.musicVolume = clampVolume(Number(volumeSlider.value) / 100);
  saveSettings(state.settings);
  setVolumeLabel();
  syncMusicState();
});
resetSaveButton.addEventListener("click", () => {
  resetSave();
  state.history = [];
  renderScene();
  toggleSettings(false);
});

setMuteLabel();
setVolumeLabel();
syncMusicState();
renderPhoneView();
updateOrientationGate();
window.addEventListener("pointerdown", tryStartMusic, { once: true });
window.addEventListener("keydown", tryStartMusic, { once: true });

window.addEventListener("resize", updateOrientationGate);
window.addEventListener("orientationchange", updateOrientationGate);

const save = loadSave();
if (save.hasSave && save.currentScene !== "home") {
  state.currentScene = save.currentScene;
}

renderScene();
