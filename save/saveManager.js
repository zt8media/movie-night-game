const SAVE_KEY = "movie-night-game-save";
const SETTINGS_KEY = "movie-night-game-settings";

const defaultSave = {
  hasSave: false,
  currentScene: "home",
  sceneState: {},
  completed: false,
};

const defaultSettings = {
  musicMuted: false,
  musicVolume: 0.45,
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
  const current = loadSave();
  const payload = {
    hasSave: sceneId !== "home",
    currentScene: sceneId,
    sceneState: current.sceneState ?? {},
    completed: current.completed ?? false,
  };

  localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  return payload;
}

export function getSceneState(sceneId, fallback = {}) {
  const save = loadSave();
  return {
    ...fallback,
    ...(save.sceneState?.[sceneId] ?? {}),
  };
}

export function saveSceneState(sceneId, sceneState) {
  const save = loadSave();
  const payload = {
    ...save,
    hasSave: save.currentScene !== "home",
    sceneState: {
      ...(save.sceneState ?? {}),
      [sceneId]: sceneState,
    },
  };

  localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  return payload;
}

export function markGameCompleted() {
  const save = loadSave();
  const payload = {
    ...save,
    completed: true,
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
