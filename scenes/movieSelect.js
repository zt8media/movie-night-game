import { getSceneState, saveSceneState } from "../save/saveManager.js";

const introDialogue = [
  { speaker: "Owner", text: "Okay." },
  { speaker: "Owner", text: "Now we can finally pick a movie." },
  { speaker: "Cat", text: "Please let this be the easy part." },
];

const twilightDialogue = [
  { speaker: "TV", text: "Playing Twilight." },
  { speaker: "Owner", text: "Finally." },
  { speaker: "Cat", text: "Movie night made it." },
];

function createDefaultMovieSelectState() {
  return {
    introIndex: 0,
    introComplete: false,
    wrongSelectionClicks: 0,
    twilightChosen: false,
    finalIndex: 0,
    finalComplete: false,
    continueTeaseSeen: false,
    activeMessage: {
      speaker: "Owner",
      text: "Okay.",
    },
  };
}

function movieSelectState() {
  return getSceneState("movieSelect", createDefaultMovieSelectState());
}

function persistMovieSelectState(nextState) {
  return saveSceneState("movieSelect", nextState);
}

function setMessage(state, speaker, text) {
  state.activeMessage = { speaker, text };
}

function advanceIntro(state) {
  if (state.introComplete) {
    return;
  }

  state.introIndex += 1;
  if (state.introIndex < introDialogue.length) {
    state.activeMessage = introDialogue[state.introIndex];
  } else {
    state.introComplete = true;
    setMessage(state, "Owner", "Pick something before the app changes its mind.");
  }
}

function advanceTwilight(state) {
  if (!state.twilightChosen || state.finalComplete) {
    return;
  }

  state.finalIndex += 1;
  if (state.finalIndex < twilightDialogue.length) {
    state.activeMessage = twilightDialogue[state.finalIndex];
  } else {
    state.finalComplete = true;
    setMessage(state, "Owner", "Continue when ready.");
  }
}

function wrongSelectionResponse(clicks) {
  if (clicks === 1) {
    return "Did you mean Twilight?";
  }

  if (clicks === 2) {
    return "Still did you mean Twilight?";
  }

  return "Nice try.";
}

export function createMovieSelectScene() {
  const state = movieSelectState();

  return {
    title: "Movie Selection",
    background: "assets/backgrounds/bg_tv_login.png",
    render() {
      const continueUnlocked = state.finalComplete;

      return `
        <section class="scene-card movie-select-scene" style="background-image: linear-gradient(rgba(33, 18, 46, 0.16), rgba(33, 18, 46, 0.54)), url('assets/backgrounds/bg_tv_login.png')">
          <div class="movie-select-stage">
            <div class="story-characters">
              <img class="story-cat-art" src="assets/cat/cat_look_right.png" alt="Black cat watching the TV">
            </div>
            <div class="movie-select-header">
              <p class="panel-label">Movie Selection</p>
              <p>${state.twilightChosen ? "Twilight selected." : state.wrongSelectionClicks > 0 ? `Wrong picks: ${state.wrongSelectionClicks}` : "Pick the movie."}</p>
            </div>
            <div class="movie-grid-panel">
              <button type="button" class="movie-card" data-movie-action="wrong-pick">Arcane</button>
              <button type="button" class="movie-card" data-movie-action="wrong-pick">Prince of Egypt</button>
              <button type="button" class="movie-card" data-movie-action="wrong-pick">Studio Ghibli movie</button>
              <button type="button" class="movie-card movie-card-twilight" data-movie-action="twilight">Twilight</button>
            </div>
          </div>

          <div class="dialogue-box">
            <div>
              <p class="dialogue-speaker">${state.activeMessage.speaker}</p>
              <p class="dialogue-text">${state.activeMessage.text}</p>
            </div>
            <div class="dialogue-controls">
              ${!state.introComplete ? `<button type="button" data-movie-action="next-intro">Next</button>` : ""}
              ${state.twilightChosen && !state.finalComplete ? `<button type="button" data-movie-action="next-final">Next</button>` : ""}
              ${continueUnlocked ? `<button type="button" data-movie-action="continue">Continue</button>` : ""}
            </div>
          </div>
        </section>
      `;
    },
    setup({ app, renderScene, goToScene }) {
      const saveAndRender = () => {
        persistMovieSelectState(state);
        renderScene();
      };

      app.querySelectorAll("[data-movie-action]").forEach((button) => {
        button.addEventListener("click", () => {
          const action = button.dataset.movieAction;

          if (action === "next-intro") {
            advanceIntro(state);
            saveAndRender();
            return;
          }

          if (action === "wrong-pick") {
            if (!state.introComplete) {
              setMessage(state, "Owner", "We are not skipping straight to the menu chaos.");
            } else if (!state.twilightChosen) {
              state.wrongSelectionClicks += 1;
              setMessage(state, "TV", wrongSelectionResponse(state.wrongSelectionClicks));
            }
            saveAndRender();
            return;
          }

          if (action === "twilight") {
            if (!state.introComplete) {
              setMessage(state, "Owner", "At least listen to the room before committing.");
            } else if (!state.twilightChosen) {
              state.twilightChosen = true;
              state.activeMessage = twilightDialogue[0];
            }
            saveAndRender();
            return;
          }

          if (action === "next-final") {
            advanceTwilight(state);
            saveAndRender();
            return;
          }

          if (action === "continue" && state.finalComplete) {
            state.continueTeaseSeen = true;
            persistMovieSelectState(state);
            goToScene("ending");
          }
        });
      });
    },
  };
}
