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
const immersiveButton = document.querySelector("#immersive-button");
const settingsButton = document.querySelector("#settings-button");
const settingsPanel = document.querySelector("#settings-panel");
const resumeButton = document.querySelector("#resume-button");
const resumeAppButton = document.querySelector("#resume-app-button");
const returnHomeButton = document.querySelector("#return-home-button");
const muteButton = document.querySelector("#mute-button");
const resetSaveButton = document.querySelector("#reset-save-button");
const notesOpenButton = document.querySelector("#notes-open-button");
const spotifyOpenButton = document.querySelector("#spotify-open-button");
const webtoonOpenButton = document.querySelector("#webtoon-open-button");
const phoneBackButton = document.querySelector("#phone-back-button");
const phoneTitle = document.querySelector("#phone-title");
const phoneHomeView = document.querySelector("#phone-home-view");
const phoneNotesView = document.querySelector("#phone-notes-view");
const phoneSpotifyView = document.querySelector("#phone-spotify-view");
const phoneWebtoonView = document.querySelector("#phone-webtoon-view");
const phoneNoteTitle = document.querySelector("#phone-note-title");
const phoneNotePaperTitle = document.querySelector("#phone-note-paper-title");
const phoneNoteMeta = document.querySelector("#phone-note-meta");
const phoneNoteContent = document.querySelector("#phone-note-content");
const spotifyPlaylist = document.querySelector("#spotify-playlist");
const orientationOverlay = document.querySelector("#orientation-overlay");
const bgMusic = document.querySelector("#bg-music");
const viewportDebug = document.querySelector("#viewport-debug");
const gameTitle = document.querySelector(".game-title");

const debugParam = new URLSearchParams(window.location.search).get("debug");
const DEBUG_STORAGE_KEY = "movie-night-debug-overlay";
const storedDebugEnabled = localStorage.getItem(DEBUG_STORAGE_KEY) === "1";
const hashDebugEnabled = window.location.hash.toLowerCase().includes("debug");
let debugEnabled = debugParam !== null
  ? !["0", "false", "off", "no"].includes(debugParam.toLowerCase())
  : storedDebugEnabled || hashDebugEnabled;

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
  todo: {
    title: "To Do List",
    items: [
      "Play Tomodachi Life",
      "Catch up on Green Yuri",
      "Re-read Osora",
      "Forgive Zari",
      "Oil change",
      "Trip to Chicago",
      "Book workout class",
      "Get grills",
      "Make matcha",
      "Fold laundry",
      "Charge headphones",
      "Figure out dinner that is not emotionally loaded",
    ],
  },
};

const spotifyPlaylists = [
  {
    id: "movie-night-mix",
    title: "Spotify Playlist",
    subtitle: "Preview or open the real playlist.",
    openUrl: "https://open.spotify.com/playlist/22H35x1f0mInw6fzdVgqKb?utm_source=generator",
    embedUrl: "https://open.spotify.com/embed/playlist/22H35x1f0mInw6fzdVgqKb?utm_source=generator",
    accent: "Twilight-coded",
  },
];

const state = {
  currentScene: "home",
  history: [],
  settingsOpen: false,
  settings: getSettings(),
  phoneView: "home",
  selectedNote: "grocery",
  selectedPlaylist: "movie-night-mix",
};

const MUSIC_LEVELS = {
  mute: 0,
  low: 0.02,
};

function clampVolume(value) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return 0.45;
  }
  return Math.min(1, Math.max(0, parsed));
}

state.settings.musicVolume = clampVolume(state.settings.musicVolume);

function normalizeMusicLevel(settings) {
  if (settings.musicMuted) {
    return "mute";
  }

  if (settings.musicLevel && MUSIC_LEVELS[settings.musicLevel] !== undefined) {
    return settings.musicLevel;
  }

  return "low";
}

state.settings.musicLevel = normalizeMusicLevel(state.settings);

function setMuteLabel() {
  muteButton.innerHTML = `<span class="phone-app-icon">${state.settings.musicLevel === "mute" ? "🔇" : "🔊"}</span><span class="phone-app-label">Music: ${state.settings.musicLevel === "mute" ? "Mute" : "Low"}</span>`;
}

function setVolumeLabel() {
  return;
}

function applyMusicLevel(level) {
  const nextLevel = MUSIC_LEVELS[level] !== undefined ? level : "low";
  state.settings.musicLevel = nextLevel;
  state.settings.musicMuted = nextLevel === "mute";
  state.settings.musicVolume = clampVolume(MUSIC_LEVELS[nextLevel]);
  saveSettings(state.settings);
  setMuteLabel();
  setVolumeLabel();
  syncMusicState();
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
  phoneNotePaperTitle.textContent = note.title;
  phoneNoteMeta.textContent = `${note.items.length} ${note.items.length === 1 ? "entry" : "entries"}`;
  phoneNoteContent.className = `note-paper-content note-paper-content-${state.selectedNote}`;

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
  spotifyPlaylist.innerHTML = spotifyPlaylists
    .map((playlist) => {
      const isActive = playlist.id === state.selectedPlaylist;
      return `
        <section class="spotify-embed-card${isActive ? " spotify-embed-card-active" : ""}">
          <div class="spotify-embed-shell ${isActive ? "" : "hidden"}" data-spotify-embed-shell="${playlist.id}">
            <iframe
              class="spotify-embed-frame"
              title="${playlist.title}"
              src="${playlist.embedUrl}"
              width="100%"
              height="352"
              frameborder="0"
              allowfullscreen=""
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            ></iframe>
          </div>
          <a class="spotify-open-link" href="${playlist.openUrl}" target="_blank" rel="noopener noreferrer">
            Open in Spotify
          </a>
        </section>
      `;
    })
    .join("");
}

function renderPhoneView() {
  const notesMode = state.phoneView === "notes";
  const spotifyMode = state.phoneView === "spotify";
  const webtoonMode = state.phoneView === "webtoon";
  phoneHomeView.classList.toggle("hidden", notesMode || spotifyMode || webtoonMode);
  phoneNotesView.classList.toggle("hidden", !notesMode);
  phoneSpotifyView.classList.toggle("hidden", !spotifyMode);
  phoneWebtoonView.classList.toggle("hidden", !webtoonMode);
  phoneBackButton.classList.toggle("hidden", !(notesMode || spotifyMode || webtoonMode));
  phoneTitle.textContent = notesMode ? "Notes" : spotifyMode ? "Spotify" : webtoonMode ? "WEBTOON" : "Phone";

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

function updateViewportDebugBadge() {
  if (!debugEnabled || !viewportDebug) {
    return;
  }

  const visual = window.visualViewport;
  const matchesMobile820 = window.matchMedia("(max-width: 820px)").matches;
  const matchesIphoneLandscape = window.matchMedia("(orientation: landscape) and (pointer: coarse) and (max-height: 620px)").matches;
  const orientation = window.matchMedia("(orientation: landscape)").matches ? "landscape" : "portrait";
  const innerWidth = Math.round(window.innerWidth);
  const innerHeight = Math.round(window.innerHeight);
  const visualWidth = visual ? Math.round(visual.width) : 0;
  const visualHeight = visual ? Math.round(visual.height) : 0;
  const visualScale = visual ? visual.scale.toFixed(2) : "n/a";
  const dpr = Number.isFinite(window.devicePixelRatio) ? window.devicePixelRatio.toFixed(2) : "n/a";

  const lines = [
    `scene ${state.currentScene} | phone:${state.settingsOpen ? "open" : "closed"}`,
    `inner ${innerWidth}x${innerHeight} | dpr ${dpr}`,
    `visual ${visualWidth}x${visualHeight} | scale ${visualScale}`,
    `screen ${window.screen.width}x${window.screen.height}`,
    `o:${orientation} m820:${matchesMobile820 ? "1" : "0"} iph-land:${matchesIphoneLandscape ? "1" : "0"}`,
  ];

  viewportDebug.textContent = lines.join("\n");
}

function setDebugEnabled(nextEnabled) {
  debugEnabled = Boolean(nextEnabled);

  if (debugEnabled) {
    localStorage.setItem(DEBUG_STORAGE_KEY, "1");
  } else {
    localStorage.removeItem(DEBUG_STORAGE_KEY);
  }

  if (viewportDebug) {
    viewportDebug.classList.toggle("hidden", !debugEnabled);
  }

  updateViewportDebugBadge();
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
  updateViewportDebugBadge();
}

function updateBackButton() {
  backButton.disabled = state.history.length === 0 || state.currentScene === "home";
}

async function enterImmersiveMode() {
  const root = document.documentElement;
  const request = root.requestFullscreen || root.webkitRequestFullscreen;

  if (request) {
    try {
      await request.call(root);
      return;
    } catch {
      // Continue to iPhone fallback guidance.
    }
  }

  const isIphone = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isIphone) {
    window.alert("iPhone full-screen tip:\nTap Share -> Add to Home Screen, then open Movie Night from your Home Screen.");
    return;
  }

  window.alert("Full-screen mode is not available in this browser.");
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
  updateViewportDebugBadge();
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
  updateViewportDebugBadge();
}

backButton.addEventListener("click", goBack);
immersiveButton?.addEventListener("click", enterImmersiveMode);
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
webtoonOpenButton.addEventListener("click", () => {
  state.phoneView = "webtoon";
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
  if (state.settings.musicLevel === "mute") {
    applyMusicLevel("low");
    return;
  }

  applyMusicLevel("mute");
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

if (viewportDebug) {
  viewportDebug.classList.toggle("hidden", !debugEnabled);
}

if (debugEnabled) {
  updateViewportDebugBadge();
}

let debugTapCount = 0;
let debugTapTimer = null;
gameTitle?.addEventListener("click", () => {
  debugTapCount += 1;

  if (debugTapTimer) {
    clearTimeout(debugTapTimer);
  }

  debugTapTimer = window.setTimeout(() => {
    debugTapCount = 0;
  }, 650);

  if (debugTapCount >= 3) {
    debugTapCount = 0;
    setDebugEnabled(!debugEnabled);
  }
});

window.addEventListener("pointerdown", tryStartMusic, { once: true });
window.addEventListener("keydown", tryStartMusic, { once: true });

window.addEventListener("resize", updateOrientationGate);
window.addEventListener("orientationchange", updateOrientationGate);
window.addEventListener("resize", updateViewportDebugBadge);
window.addEventListener("orientationchange", updateViewportDebugBadge);

if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", updateViewportDebugBadge);
  window.visualViewport.addEventListener("scroll", updateViewportDebugBadge);
}

const save = loadSave();
if (save.hasSave && save.currentScene !== "home") {
  state.currentScene = save.currentScene;
}

renderScene();
