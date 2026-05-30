import { getSceneState, saveSceneState } from "../save/saveManager.js";

const storyDialogue = [
  { speaker: "Owner", text: "Okay." },
  { speaker: "Owner", text: "Dinner is done." },
  { speaker: "Owner", text: "Now we just need the remote." },
  { speaker: "Owner", text: "…" },
  { speaker: "Owner", text: "Where is the remote?" },
  { speaker: "Cat", text: "…" },
  { speaker: "Cat", text: "I might know something." },
  { speaker: "Owner", text: "What does that mean?" },
  { speaker: "Cat", text: "Nothing." },
  { speaker: "Cat", text: "Probably." },
];

const finalDialogue = [
  { speaker: "Owner", text: "There it is." },
  { speaker: "Owner", text: "How did it even get there?" },
  { speaker: "Cat", text: "…" },
  { speaker: "Cat", text: "I have no comment." },
];

const clueMessages = {
  bookshelf: "No remote here. Just very judgmental novels.",
  blanket: "Just a suspiciously rumpled blanket.",
  wallArt: "Now why would it be over there?",
  lamp: "Bright idea. No remote.",
  rug: "Something was definitely dragged across here.",
  catBed: "Suspiciously warm.",
  table: "No remote. Just evidence of dinner.",
};

const clueLabels = {
  bookshelf: "Bookshelf",
  blanket: "Blanket",
  wallArt: "Wall Art",
  lamp: "Lamp",
  rug: "Rug",
  catBed: "Cat Bed",
  table: "Table",
};

const totalClues = Object.keys(clueLabels).length;

function createDefaultRemoteState() {
  return {
    storyIndex: 0,
    storyComplete: false,
    gameplayStarted: false,
    cluesViewed: {
      bookshelf: false,
      blanket: false,
      wallArt: false,
      lamp: false,
      rug: false,
      catBed: false,
      table: false,
    },
    clueCount: 0,
    remoteRevealed: false,
    remoteFound: false,
    finalIndex: 0,
    finalComplete: false,
    activeMessage: {
      speaker: "Owner",
      text: "Okay.",
    },
  };
}

function remoteState() {
  return getSceneState("remote", createDefaultRemoteState());
}

function persistRemoteState(nextState) {
  return saveSceneState("remote", nextState);
}

function setMessage(state, speaker, text) {
  state.activeMessage = { speaker, text };
}

function viewedClueCount(state) {
  return Object.values(state.cluesViewed).filter(Boolean).length;
}

function advanceDialogue(state, sequence) {
  if (sequence === "story" && !state.storyComplete) {
    state.storyIndex += 1;
    if (state.storyIndex < storyDialogue.length) {
      state.activeMessage = storyDialogue[state.storyIndex];
    } else {
      state.storyComplete = true;
      setMessage(state, "Owner", "Search the room.");
    }
    return;
  }

  if (sequence === "final" && state.remoteFound && !state.finalComplete) {
    state.finalIndex += 1;
    if (state.finalIndex < finalDialogue.length) {
      state.activeMessage = finalDialogue[state.finalIndex];
    } else {
      state.finalComplete = true;
      setMessage(state, "Owner", "Continue when ready.");
    }
  }
}

function maybeRevealRemote(state) {
  if (state.remoteRevealed || viewedClueCount(state) < totalClues) {
    return;
  }

  state.remoteRevealed = true;
  setMessage(state, "Owner", "All right. Check the couch.");
}

function renderStoryMode(state) {
  return `
    <div class="story-stage">
      <div class="story-characters">
        <div class="owner-standin kitchen-owner-standin">Owner</div>
        <img class="story-cat-art" src="assets/cat/cat_look_right.png" alt="Black cat in the living room">
      </div>
      <div class="dialogue-box story-dialogue-box">
        <div>
          <p class="dialogue-speaker">${state.activeMessage.speaker}</p>
          <p class="dialogue-text">${state.activeMessage.text}</p>
        </div>
        <div class="dialogue-controls">
          ${!state.storyComplete ? `<button type="button" data-remote-action="next" data-sequence="story">Continue</button>` : `<button type="button" data-remote-action="start-search">Search the Room</button>`}
        </div>
      </div>
    </div>
  `;
}

function renderClueHotspot(clueKey, className) {
  return `
    <button class="hotspot hotspot-dot ${className}" type="button" data-remote-action="clue" data-clue="${clueKey}" aria-label="${clueLabels[clueKey]}" title="${clueLabels[clueKey]}">
      <span class="hotspot-dot-inner" aria-hidden="true"></span>
    </button>
  `;
}

function renderGameplayMode(state) {
  const clueCount = viewedClueCount(state);
  const finalMode = state.remoteFound && !state.finalComplete;
  const continueUnlocked = state.finalComplete;

  return `
    <div class="remote-hud">
      <div class="ingredient-panel">
        <p class="panel-label">Clues Checked</p>
        <ul>
          <li>${clueCount} / ${totalClues}</li>
          <li>${state.remoteRevealed ? "Remote location unlocked" : "Check every clue object"}</li>
          <li>${state.remoteFound ? "Remote recovered" : "Remote still missing"}</li>
        </ul>
      </div>
      <div class="remote-mode-pill">
        <p class="panel-label">Search Mode</p>
        <p>Check each clue once.</p>
      </div>
      <div class="cat-status">
        <img src="assets/cat/${state.remoteFound ? "cat_happy" : state.remoteRevealed ? "cat_guilty" : "cat_think"}.png" alt="Cat expression">
      </div>
    </div>

    <div class="remote-playfield">
      ${renderClueHotspot("bookshelf", "hotspot-bookshelf")}
      ${renderClueHotspot("blanket", "hotspot-blanket")}
      ${renderClueHotspot("wallArt", "hotspot-wall-art")}
      ${renderClueHotspot("lamp", "hotspot-lamp")}
      ${renderClueHotspot("rug", "hotspot-rug")}
      ${renderClueHotspot("catBed", "hotspot-cat-bed")}
      ${renderClueHotspot("table", "hotspot-table")}

      ${state.remoteRevealed && !state.remoteFound ? `
        <button class="hotspot hotspot-dot hotspot-dot-alert hotspot-remote hotspot-remote-couch" type="button" data-remote-action="find-remote" aria-label="Check under the couch">
          <span class="hotspot-dot-inner" aria-hidden="true"></span>
        </button>
      ` : ""}

      ${state.remoteFound ? `
        <img class="remote-placeholder-image" src="assets/items/remote_placeholder.png" alt="Remote found on the table">
      ` : ""}
    </div>

    <div class="dialogue-box">
      <div>
        <p class="dialogue-speaker">${state.activeMessage.speaker}</p>
        <p class="dialogue-text">${state.activeMessage.text}</p>
      </div>
      <div class="dialogue-controls">
        ${finalMode ? `<button type="button" data-remote-action="next" data-sequence="final">Next</button>` : ""}
        ${(state.remoteFound || continueUnlocked) ? `<button type="button" data-remote-action="continue" ${continueUnlocked ? "" : "disabled"}>Continue</button>` : ""}
      </div>
    </div>
  `;
}

export function createRemoteScene() {
  const state = remoteState();

  return {
    title: "Remote Search",
    background: "assets/backgrounds/bg_home.png",
    render() {
      return `
        <section class="scene-card kitchen-scene ${state.gameplayStarted ? "kitchen-scene-gameplay" : "kitchen-scene-story"}" style="background-image: linear-gradient(rgba(33, 18, 46, 0.15), rgba(33, 18, 46, 0.48)), url('assets/backgrounds/bg_home.png')">
          ${!state.gameplayStarted ? renderStoryMode(state) : renderGameplayMode(state)}
        </section>
      `;
    },
    setup({ app, renderScene, goToScene }) {
      const saveAndRender = () => {
        persistRemoteState(state);
        renderScene();
      };

      app.querySelectorAll("[data-remote-action]").forEach((button) => {
        button.addEventListener("click", () => {
          const action = button.dataset.remoteAction;

          if (action === "next") {
            advanceDialogue(state, button.dataset.sequence);
            saveAndRender();
            return;
          }

          if (action === "start-search") {
            state.gameplayStarted = true;
            setMessage(state, "Owner", "Check every spot. The remote is in here somewhere.");
            saveAndRender();
            return;
          }

          if (action === "clue") {
            const clue = button.dataset.clue;
            if (!state.cluesViewed[clue]) {
              state.cluesViewed[clue] = true;
              state.clueCount = viewedClueCount(state);
            }

            setMessage(state, "Cat", clueMessages[clue]);
            maybeRevealRemote(state);
            saveAndRender();
            return;
          }

          if (action === "find-remote" && state.remoteRevealed) {
            state.remoteFound = true;
            state.activeMessage = finalDialogue[0];
            saveAndRender();
            return;
          }

          if (action === "continue" && state.finalComplete) {
            persistRemoteState(state);
            goToScene("login");
          }
        });
      });
    },
  };
}
