import { markGameCompleted, getSceneState, resetSave, saveSceneState } from "../save/saveManager.js";

const endingSequence = [
  { speaker: "Owner", text: "Well." },
  { speaker: "Owner", text: "We got here eventually." },
  { speaker: "Owner", text: "Even if it took a little longer than planned." },
  { speaker: "Cat", text: "…" },
  { speaker: "Cat", text: "I didn’t mean to make everything harder." },
  { speaker: "Owner", text: "I know." },
  { speaker: "Owner", text: "You were trying to help." },
  { speaker: "Cat", text: "…" },
  { speaker: "Owner", text: "I know that too." },
  { speaker: "pause", text: "Pause." },
  { speaker: "Owner", text: "Come here." },
  { speaker: "move", text: "Cat moves to center of couch." },
  { speaker: "pause", text: "Pause." },
  { speaker: "Cat", text: "Okay." },
];

const finalCards = [
  "Movie night made it after all.",
  "Sometimes things don’t go perfectly.",
  "That doesn’t mean they can’t still turn out okay.",
];

function createDefaultEndingState() {
  return {
    sequenceIndex: 0,
    sequenceComplete: false,
    cardIndex: -1,
    cardsComplete: false,
    completedMarked: false,
    catCentered: false,
    activeMessage: {
      speaker: "Owner",
      text: "Well.",
    },
  };
}

function endingState() {
  return getSceneState("ending", createDefaultEndingState());
}

function persistEndingState(nextState) {
  return saveSceneState("ending", nextState);
}

function setMessage(state, speaker, text) {
  state.activeMessage = { speaker, text };
}

function advanceEndingSequence(state) {
  if (state.sequenceComplete) {
    return;
  }

  state.sequenceIndex += 1;
  if (state.sequenceIndex < endingSequence.length) {
    const beat = endingSequence[state.sequenceIndex];
    if (beat.speaker === "pause") {
      setMessage(state, "", "...");
    } else if (beat.speaker === "move") {
      state.catCentered = true;
      setMessage(state, "", "The cat curls into the center of the couch.");
    } else {
      setMessage(state, beat.speaker, beat.text);
    }
  } else {
    state.sequenceComplete = true;
    state.cardIndex = 0;
  }
}

function advanceFinalCards(state) {
  if (!state.sequenceComplete || state.cardsComplete) {
    return;
  }

  state.cardIndex += 1;
  if (state.cardIndex >= finalCards.length) {
    state.cardsComplete = true;
  }
}

export function createEndingScene() {
  const state = endingState();

  return {
    title: "Ending",
    background: "assets/backgrounds/bg_livingroom_end.png",
    render() {
      const visibleCard = state.sequenceComplete && !state.cardsComplete && state.cardIndex >= 0
        ? finalCards[state.cardIndex]
        : "";

      return `
        <section class="scene-card ending-scene" style="background-image: linear-gradient(rgba(33, 18, 46, 0.12), rgba(33, 18, 46, 0.48)), url('assets/backgrounds/bg_livingroom_end.png')">
          <div class="ending-stage">
            <div class="ending-characters">
              <img
                class="ending-cat ${state.catCentered ? "ending-cat-sleeping" : "ending-cat-apology"}"
                src="assets/cat/${state.catCentered ? "cat_sleep" : "cat_apology"}.png"
                alt="Black cat on the couch"
              >
            </div>
          </div>

          ${state.sequenceComplete ? `
            <div class="ending-fade-panel ${state.cardsComplete ? "ending-fade-panel-complete" : ""}">
              ${visibleCard ? `<p class="ending-card-text">${visibleCard}</p>` : ""}
              ${state.cardsComplete ? `
                <div class="credits-block">
                  <h2>Movie Night</h2>
                  <p>Created by:<br>Player Name or Creator</p>
                  <p>Special Thanks:<br>One very patient friend</p>
                  <p>The End</p>
                </div>
              ` : ""}
            </div>
          ` : ""}

          <div class="dialogue-box">
            <div>
              ${state.activeMessage.speaker ? `<p class="dialogue-speaker">${state.activeMessage.speaker}</p>` : ""}
              <p class="dialogue-text">${state.activeMessage.text}</p>
            </div>
            <div class="dialogue-controls">
              ${!state.sequenceComplete ? `<button type="button" data-ending-action="next-sequence">Next</button>` : ""}
              ${state.sequenceComplete && !state.cardsComplete ? `<button type="button" data-ending-action="next-card">${state.cardIndex < 0 ? "Begin Final Text" : "Next"}</button>` : ""}
              ${state.cardsComplete ? `<button type="button" data-ending-action="return-home">Return To Home</button>` : ""}
              ${state.cardsComplete ? `<button type="button" data-ending-action="play-again">Play Again</button>` : ""}
            </div>
          </div>
        </section>
      `;
    },
    setup({ app, renderScene, goToScene }) {
      const saveAndRender = () => {
        persistEndingState(state);
        renderScene();
      };

      if (state.cardsComplete && !state.completedMarked) {
        state.completedMarked = true;
        persistEndingState(state);
        markGameCompleted();
      }

      app.querySelectorAll("[data-ending-action]").forEach((button) => {
        button.addEventListener("click", () => {
          const action = button.dataset.endingAction;

          if (action === "next-sequence") {
            advanceEndingSequence(state);
            saveAndRender();
            return;
          }

          if (action === "next-card") {
            advanceFinalCards(state);
            saveAndRender();
            if (state.cardsComplete && !state.completedMarked) {
              state.completedMarked = true;
              persistEndingState(state);
              markGameCompleted();
              renderScene();
            }
            return;
          }

          if (action === "return-home") {
            persistEndingState(state);
            goToScene("home", { addToHistory: false, persist: false });
            return;
          }

          if (action === "play-again") {
            resetSave();
            goToScene("kitchen", { addToHistory: false, persist: true });
          }
        });
      });
    },
  };
}
