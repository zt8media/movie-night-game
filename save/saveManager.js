const SAVE_KEY = "movie-night-game-save";
const SETTINGS_KEY = "movie-night-game-settings";

const defaultSave = {
  hasSave: false,
  currentScene: "home",
};

const defaultSettings = {
  musicMuted: false,
};

function safeParse(value, fallback) {
  try {
    return value ? { ...fallback, ...JSON.parse(value) } : fallback;
  } catch {
    return fallback;
  }
}

export function loadSave() {
  return safeParse(localStorage.getItem(SAVE_KEY), defaultSave);
}

export function saveScene(sceneId) {
  const payload = {
    hasSave: sceneId !== "home",
    currentScene: sceneId,
  };

  localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  return payload;
}

export function resetSave() {
  localStorage.removeItem(SAVE_KEY);
}

export function getSettings() {
  return safeParse(localStorage.getItem(SETTINGS_KEY), defaultSettings);
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
