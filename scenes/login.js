import { getSceneState, saveSceneState } from "../save/saveManager.js";

const correctPassword = "imsorry67";

const storyDialogue = [
  { speaker: "Owner", text: "Okay." },
  { speaker: "Owner", text: "We have dinner." },
  { speaker: "Owner", text: "We have the remote." },
  { speaker: "Owner", text: "Now we can finally watch the movie." },
  { speaker: "TV", text: "Session expired. Please sign in." },
  { speaker: "Owner", text: "…" },
  { speaker: "Owner", text: "Of course." },
  { speaker: "Cat", text: "…" },
  { speaker: "Owner", text: "I think the password is in my notes." },
  { speaker: "Cat", text: "That sounds safe." },
];

function createDefaultLoginState() {
  return {
    storyIndex: 0,
    storyComplete: false,
    gameplayStarted: false,
    enteredPassword: "",
    loginComplete: false,
    continueTeaseSeen: false,
    activeMessage: {
      speaker: "Owner",
      text: "Okay.",
    },
  };
}

function loginState() {
  return getSceneState("login", createDefaultLoginState());
}

function persistLoginState(nextState) {
  return saveSceneState("login", nextState);
}

function setMessage(state, speaker, text) {
  state.activeMessage = { speaker, text };
}

function advanceStory(state) {
  if (state.storyComplete) {
    return;
  }

  state.storyIndex += 1;
  if (state.storyIndex < storyDialogue.length) {
    state.activeMessage = storyDialogue[state.storyIndex];
  } else {
    state.storyComplete = true;
    setMessage(state, "Owner", "Open the sign-in screen.");
  }
}

function renderStoryMode(state) {
  return `
    <div class="story-stage">
      <div class="story-characters">
        <div class="owner-standin kitchen-owner-standin">Owner</div>
        <img class="story-cat-art" src="assets/cat/cat_look_right.png" alt="Black cat on the couch facing the TV">
      </div>
      <div class="dialogue-box story-dialogue-box">
        <div>
          <p class="dialogue-speaker">${state.activeMessage.speaker}</p>
          <p class="dialogue-text">${state.activeMessage.text}</p>
        </div>
        <div class="dialogue-controls">
          ${!state.storyComplete ? `<button type="button" data-login-action="next-story">Continue</button>` : `<button type="button" data-login-action="start-sign-in">Sign In</button>`}
        </div>
      </div>
    </div>
  `;
}

function renderGameplayMode(state) {
  const continueUnlocked = state.loginComplete;

  return `
    <div class="login-scene-stage">
      <div class="login-stage">
        <section class="tv-screen-panel">
          <div class="tv-screen">
            <p class="tv-brand">STREAMBOX+</p>
            <h2>Sign In</h2>
            <p class="tv-helper">${state.loginComplete ? "Streaming unlocked." : "Use the phone Notes app if you need the password."}</p>
            <label class="tv-label" for="streaming-password">Password</label>
            <input id="streaming-password" class="tv-password-input" type="password" value="${state.enteredPassword}" placeholder="Enter password" ${state.loginComplete ? "disabled" : ""}>
            <div class="tv-actions">
              <button type="button" data-login-action="submit-password" ${state.loginComplete ? "disabled" : ""}>Submit</button>
            </div>
          </div>
        </section>
      </div>
    </div>

    <div class="dialogue-box">
      <div>
        <p class="dialogue-speaker">${state.activeMessage.speaker}</p>
        <p class="dialogue-text">${state.activeMessage.text}</p>
      </div>
      <div class="dialogue-controls">
        ${continueUnlocked ? `<button type="button" data-login-action="continue">Continue</button>` : ""}
      </div>
    </div>
  `;
}

export function createLoginScene() {
  const state = loginState();

  return {
    title: "Streaming Login",
    background: "assets/backgrounds/bg_tv_login.png",
    render() {
      return `
        <section class="scene-card kitchen-scene login-scene ${state.gameplayStarted ? "kitchen-scene-gameplay" : "kitchen-scene-story"}" style="background-image: linear-gradient(rgba(33, 18, 46, 0.16), rgba(33, 18, 46, 0.54)), url('assets/backgrounds/bg_tv_login.png')">
          ${!state.gameplayStarted ? renderStoryMode(state) : renderGameplayMode(state)}
        </section>
      `;
    },
    setup({ app, renderScene, goToScene }) {
      const saveAndRender = () => {
        persistLoginState(state);
        renderScene();
      };

      const passwordInput = app.querySelector("#streaming-password");
      if (passwordInput) {
        passwordInput.addEventListener("input", (event) => {
          state.enteredPassword = event.target.value;
          persistLoginState(state);
        });
      }

      app.querySelectorAll("[data-login-action]").forEach((button) => {
        button.addEventListener("click", () => {
          const action = button.dataset.loginAction;

          if (action === "next-story") {
            advanceStory(state);
            saveAndRender();
            return;
          }

          if (action === "start-sign-in") {
            state.gameplayStarted = true;
            setMessage(state, "Owner", "All right. Password time.");
            saveAndRender();
            return;
          }

          if (action === "submit-password") {
            const entered = state.enteredPassword.trim();
            if (entered !== correctPassword) {
              setMessage(state, "TV", "Incorrect password.");
              persistLoginState(state);
              renderScene();
              setTimeout(() => {
                state.activeMessage = { speaker: "Owner", text: "Nope." };
                persistLoginState(state);
                renderScene();
              }, 400);
              return;
            }

            state.loginComplete = true;
            state.activeMessage = { speaker: "TV", text: "Welcome back." };
            persistLoginState(state);
            renderScene();
            setTimeout(() => {
              if (state.loginComplete) {
                state.activeMessage = { speaker: "Owner", text: "There we go." };
                persistLoginState(state);
                renderScene();
                setTimeout(() => {
                  if (state.loginComplete) {
                    state.activeMessage = { speaker: "Cat", text: "Maybe that helped." };
                    persistLoginState(state);
                    renderScene();
                  }
                }, 450);
              }
            }, 450);
            return;
          }

          if (action === "continue" && state.loginComplete) {
            state.continueTeaseSeen = true;
            persistLoginState(state);
            goToScene("movieSelect");
          }
        });
      });
    },
  };
}
