import { getSceneState, saveSceneState } from "../save/saveManager.js";

function createDefaultKitchenState() {
  return {
    storyIndex: 0,
    storyComplete: false,
    recipeOpen: false,
    gameplayStarted: false,
    ingredients: {
      pasta: false,
      sauce: false,
      cheese: false,
      garlic: false,
    },
    spillTriggered: false,
    spillCleaned: false,
    scrubProgress: 0,
    spongeReady: false,
    spillSpots: {
      one: false,
      two: false,
      three: false,
    },
    postSpillIndex: 0,
    postSpillComplete: false,
    finalIndex: 0,
    finalComplete: false,
    activeMessage: {
      speaker: "Owner",
      text: "Okay.",
    },
  };
}

const storyDialogue = [
  { speaker: "Owner", text: "Okay." },
  { speaker: "Owner", text: "Dinner first." },
  { speaker: "Owner", text: "Then movie night." },
  { speaker: "Cat", text: "I can help." },
  { speaker: "Owner", text: "Please don’t." },
  { speaker: "Cat", text: "…" },
  { speaker: "Cat", text: "I am choosing to hear that as encouragement." },
];

const postSpillDialogue = [
  { speaker: "Owner", text: "Seriously?" },
  { speaker: "Cat", text: "…" },
];

const finalDialogue = [
  { speaker: "Owner", text: "Okay." },
  { speaker: "Owner", text: "Dinner saved." },
];

function kitchenState() {
  return getSceneState("kitchen", createDefaultKitchenState());
}

function persistKitchenState(nextState) {
  return saveSceneState("kitchen", nextState);
}

function ingredientsComplete(state) {
  return Object.values(state.ingredients).every(Boolean);
}

function finalSequenceReady(state) {
  return ingredientsComplete(state) && state.spillCleaned;
}

function allSpillSpotsCleaned(state) {
  return Object.values(state.spillSpots).every(Boolean);
}

function setMessage(state, speaker, text) {
  state.activeMessage = { speaker, text };
}

function advanceDialogue(state, sequenceName) {
  if (sequenceName === "story" && !state.storyComplete) {
    state.storyIndex += 1;
    if (state.storyIndex < storyDialogue.length) {
      state.activeMessage = storyDialogue[state.storyIndex];
    } else {
      state.storyComplete = true;
      setMessage(state, "Owner", "Pick something from the cookbook.");
    }
    return;
  }

  if (sequenceName === "spill" && state.spillTriggered && !state.postSpillComplete) {
    state.postSpillIndex += 1;
    if (state.postSpillIndex < postSpillDialogue.length) {
      state.activeMessage = postSpillDialogue[state.postSpillIndex];
    } else {
      state.postSpillComplete = true;
      setMessage(state, "Cat", "I should probably clean that up.");
    }
    return;
  }

  if (sequenceName === "final" && finalSequenceReady(state) && !state.finalComplete) {
    state.finalIndex += 1;
    if (state.finalIndex < finalDialogue.length) {
      state.activeMessage = finalDialogue[state.finalIndex];
    } else {
      state.finalComplete = true;
      setMessage(state, "Cat", "Scene 1 complete. Continue when ready.");
    }
  }
}

function markIngredient(state, key, speaker, text) {
  if (state.ingredients[key]) {
    return false;
  }

  state.ingredients[key] = true;
  setMessage(state, speaker, text);
  return true;
}

function maybeStartFinalDialogue(state) {
  if (finalSequenceReady(state) && !state.finalComplete && state.finalIndex === 0) {
    state.activeMessage = finalDialogue[0];
  }
}

function renderChecklistItem(label, done) {
  return `<li>${done ? "✓" : " "} ${label}</li>`;
}

function renderKitchenHotspot({ className, action, item = "", text = "", label, image, alt, extraClass = "" }) {
  const classes = ["hotspot", "hotspot-kitchen-art", className, extraClass].filter(Boolean).join(" ");
  return `
    <button
      class="${classes}"
      type="button"
      data-kitchen-action="${action}"
      ${item ? `data-item="${item}"` : ""}
      ${text ? `data-text="${text}"` : ""}
      aria-label="${label}"
      title="${label}"
    >
      <img class="hotspot-kitchen-image" src="${image}" alt="${alt}">
    </button>
  `;
}

function renderStoryMode(state) {
  return `
    <div class="story-stage">
      <div class="story-characters">
        <div class="owner-standin kitchen-owner-standin">Owner</div>
        <img class="story-cat-art" src="assets/cat/cat_sniff.png" alt="Black cat waiting in the kitchen">
      </div>
      <div class="dialogue-box story-dialogue-box">
        <div>
          <p class="dialogue-speaker">${state.activeMessage.speaker}</p>
          <p class="dialogue-text">${state.activeMessage.text}</p>
        </div>
        <div class="dialogue-controls">
          <button type="button" data-kitchen-action="next" data-sequence="story">Continue</button>
        </div>
      </div>
    </div>
  `;
}

function renderCookbookMode(state) {
  return `
    <div class="cookbook-stage">
      <section class="cookbook-panel">
        ${state.recipeOpen ? `
          <div class="cookbook-page">
            <p class="panel-label">Movie Night Cookbook</p>
            <h2>Regretti Spaghetti (Gluten Free)</h2>
            <div class="cookbook-recipe-hero">
              <img src="assets/items/spagetti.png" alt="Regretti Spaghetti">
            </div>
            <p>A classic movie night meal.</p>
            <p>Usually turns out better than expected.</p>
            <div class="cookbook-ingredients">
              <p class="panel-label">Ingredients</p>
              <ul>
                <li>Pasta</li>
                <li>Sauce</li>
                <li>Garlic</li>
                <li>Cheese</li>
              </ul>
            </div>
            <div class="dialogue-controls">
              <button type="button" data-kitchen-action="back-cookbook">Back</button>
              <button type="button" data-kitchen-action="start-cooking">Start Cooking</button>
            </div>
          </div>
        ` : `
          <div class="cookbook-page">
            <p class="panel-label">Movie Night Cookbook</p>
            <h2>Movie Night Cookbook</h2>
            <p class="cookbook-kicker">Pick tonight’s culinary destiny.</p>
            <div class="cookbook-options cookbook-choice-grid">
              <button type="button" class="cookbook-choice-card cookbook-choice-spaghetti" data-kitchen-action="choose-recipe" data-choice="spaghetti" aria-label="Choose Regretti Spaghetti">
                <span class="cookbook-choice-image-wrap">
                  <img src="assets/items/spagetti.png" alt="Regretti Spaghetti">
                </span>
                <span class="cookbook-choice-copy">
                  <span class="cookbook-choice-title">Regretti Spaghetti</span>
                  <span class="cookbook-choice-subtitle">Gluten Free</span>
                  <span class="cookbook-choice-note">Comfort food with redemption arc energy.</span>
                </span>
              </button>

              <button type="button" class="cookbook-choice-card cookbook-choice-water" data-kitchen-action="choose-recipe" data-choice="water" aria-label="Choose Water">
                <span class="cookbook-choice-image-wrap">
                  <img src="assets/items/water.png" alt="Glass of water">
                </span>
                <span class="cookbook-choice-copy">
                  <span class="cookbook-choice-title">Water</span>
                  <span class="cookbook-choice-subtitle">Technically edible</span>
                  <span class="cookbook-choice-note">Hydration: yes. Dinner: debatable.</span>
                </span>
              </button>
            </div>
          </div>
        `}
      </section>
      <div class="dialogue-box story-dialogue-box">
        <div>
          <p class="dialogue-speaker">${state.activeMessage.speaker}</p>
          <p class="dialogue-text">${state.activeMessage.text}</p>
        </div>
      </div>
    </div>
  `;
}

function renderGameplayMode(state) {
  const spillMiniGameActive = state.spillTriggered && !state.spillCleaned;
  const finalReady = finalSequenceReady(state);
  const dialogueMode = spillMiniGameActive && !state.postSpillComplete
    ? "spill"
    : finalReady && !state.finalComplete
      ? "final"
      : "free";

  return `
    <div class="kitchen-hud">
      <div class="ingredient-panel">
        <p class="panel-label">Ingredients Found</p>
        <ul>
          ${renderChecklistItem("Pasta", state.ingredients.pasta)}
          ${renderChecklistItem("Sauce", state.ingredients.sauce)}
          ${renderChecklistItem("Cheese", state.ingredients.cheese)}
          ${renderChecklistItem("Garlic", state.ingredients.garlic)}
        </ul>
      </div>
      <div class="gameplay-banner kitchen-mode-pill">
        <p class="panel-label">Cooking Mode</p>
        <p>Find everything for Regretti Spaghetti.</p>
      </div>
      <div class="cat-status">
        <img src="assets/cat/${spillMiniGameActive ? "cat_guilty" : finalReady ? "cat_happy" : "cat_sniff"}.png" alt="Cat expression">
      </div>
    </div>

    <div class="kitchen-playfield">
      ${renderKitchenHotspot({
        className: "hotspot-pasta",
        action: "ingredient",
        item: "pasta",
        label: "Pasta Box",
        image: "assets/items/pasta.png",
        alt: "Pasta box",
      })}
      ${renderKitchenHotspot({
        className: "hotspot-sauce",
        action: "ingredient",
        item: "sauce",
        label: "Sauce Jar",
        image: "assets/items/sauce.png",
        alt: "Sauce jar",
      })}
      ${renderKitchenHotspot({
        className: "hotspot-cheese",
        action: "ingredient",
        item: "cheese",
        label: "Cheese Drawer",
        image: "assets/items/cheese.png",
        alt: "Cheese item",
      })}
      ${renderKitchenHotspot({
        className: "hotspot-garlic",
        action: "ingredient",
        item: "garlic",
        label: "Garlic Basket",
        image: "assets/items/garlic.png",
        alt: "Garlic item",
      })}

      ${renderKitchenHotspot({
        className: "hotspot-sorry",
        action: "flavor",
        text: "Crunchy circles of reflection.",
        label: "Sorry-O’s",
        image: "assets/items/sorry_cereal.png",
        alt: "Sorry-O's cereal",
      })}
      ${renderKitchenHotspot({
        className: "hotspot-cheese-joke",
        action: "flavor",
        text: "Apolo-cheese accepted in cracker form.",
        label: "Apolo-cheese Crackers",
        image: "assets/items/crackers.png",
        alt: "Apolo-cheese crackers",
      })}
      ${renderKitchenHotspot({
        className: "hotspot-mix",
        action: "flavor",
        text: "A suspicious little stash of catnip.",
        label: "Catnip",
        image: "assets/items/catnip.png",
        alt: "Catnip",
      })}

      ${spillMiniGameActive ? `
        <div class="spill-status spill-status-top" data-spill-status>${state.spongeReady ? "Tap the three spill spots to clean them." : "Tap the sponge, then clean the three spill spots."}</div>
        <div class="spill-zone" data-spill-zone>
          <img class="spill-image" data-spill-image src="assets/items/spill.png" alt="Sauce spill" style="opacity: ${Math.max(0.2, 1 - state.scrubProgress / 8)};">
          ${!state.spillSpots.one ? `<button class="spill-spot spill-spot-one" type="button" data-kitchen-action="clean-spot" data-spot="one" aria-label="Clean spill spot one"></button>` : ""}
          ${!state.spillSpots.two ? `<button class="spill-spot spill-spot-two" type="button" data-kitchen-action="clean-spot" data-spot="two" aria-label="Clean spill spot two"></button>` : ""}
          ${!state.spillSpots.three ? `<button class="spill-spot spill-spot-three" type="button" data-kitchen-action="clean-spot" data-spot="three" aria-label="Clean spill spot three"></button>` : ""}
        </div>
        ${renderKitchenHotspot({
          className: "hotspot-sponge",
          action: "sponge",
          label: "Sponge",
          image: "assets/items/sponge.png",
          alt: "Sponge",
          extraClass: state.spongeReady ? "sponge-ready" : "",
        })}
      ` : ""}
    </div>

    <div class="dialogue-box">
      <div>
        <p class="dialogue-speaker">${state.activeMessage.speaker}</p>
        <p class="dialogue-text">${state.activeMessage.text}</p>
      </div>
      <div class="dialogue-controls">
        ${dialogueMode !== "free" ? `<button type="button" data-kitchen-action="next" data-sequence="${dialogueMode}">Next</button>` : ""}
        ${finalReady ? `<button type="button" data-kitchen-action="continue" ${state.finalComplete ? "" : "disabled"}>Continue</button>` : ""}
      </div>
    </div>
  `;
}

export function createKitchenScene() {
  const state = kitchenState();

  return {
    title: "Kitchen",
    background: "assets/backgrounds/bg_kitchen.png",
    render() {
      return `
        <section class="scene-card kitchen-scene ${state.gameplayStarted ? "kitchen-scene-gameplay" : "kitchen-scene-story"}" style="background-image: linear-gradient(rgba(3, 9, 18, 0.16), rgba(3, 9, 18, 0.58)), url('assets/backgrounds/bg_kitchen.png')">
          ${!state.storyComplete ? renderStoryMode(state) : !state.gameplayStarted ? renderCookbookMode(state) : renderGameplayMode(state)}
        </section>
      `;
    },
    setup({ app, renderScene, goToScene }) {
      const saveAndRender = () => {
        persistKitchenState(state);
        renderScene();
      };

      const updateSpillVisual = () => {
        const spillImage = app.querySelector("[data-spill-image]");
        const spillStatus = app.querySelector("[data-spill-status]");
        if (spillImage) {
          spillImage.style.opacity = String(Math.max(0.2, 1 - state.scrubProgress / 3.5));
        }
        if (spillStatus && state.scrubProgress > 0 && !state.spillCleaned) {
          spillStatus.textContent = `Cleaned ${Math.min(state.scrubProgress, 3)} of 3 spill spots.`;
        }
      };

      const cleanSpillSpot = (spot) => {
        if (!state.spillTriggered || state.spillCleaned || !state.postSpillComplete) {
          return;
        }
        if (!state.spillSpots[spot]) {
          state.spillSpots[spot] = true;
          state.scrubProgress += 1;
        }

        if (allSpillSpotsCleaned(state)) {
          state.spillCleaned = true;
          state.spongeReady = false;
          setMessage(state, "Cat", "Clean enough to deny responsibility.");
          maybeStartFinalDialogue(state);
          saveAndRender();
          return;
        }

        persistKitchenState(state);
        renderScene();
      };

      const buttons = app.querySelectorAll("[data-kitchen-action]");
      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          const action = button.dataset.kitchenAction;

          if (action === "next") {
            advanceDialogue(state, button.dataset.sequence);
            persistKitchenState(state);
            renderScene();
            return;
          }

          if (action === "choose-recipe") {
            if (button.dataset.choice === "water") {
              state.recipeOpen = false;
              setMessage(state, "Owner", "We should probably eat something.");
              saveAndRender();
              setTimeout(() => {
                state.activeMessage = { speaker: "Cat", text: "That was worth a shot." };
                persistKitchenState(state);
                renderScene();
              }, 350);
              return;
            }

            if (button.dataset.choice === "spaghetti") {
              state.recipeOpen = true;
              setMessage(state, "Owner", "All right. Let’s make the Regretti Spaghetti.");
              saveAndRender();
            }
            return;
          }

          if (action === "back-cookbook") {
            state.recipeOpen = false;
            setMessage(state, "Owner", "Pick something from the cookbook.");
            saveAndRender();
            return;
          }

          if (action === "start-cooking") {
            state.gameplayStarted = true;
            setMessage(state, "Cat", "Time to inspect the kitchen.");
            saveAndRender();
            return;
          }

          if (action === "ingredient") {
            const item = button.dataset.item;
            if (item === "pasta") {
              markIngredient(state, "pasta", "Cat", "Pasta located. I am carrying this kitchen.");
            } else if (item === "cheese") {
              markIngredient(state, "cheese", "Owner", "Cheese. Good. One useful thing at a time.");
            } else if (item === "garlic") {
              markIngredient(state, "garlic", "Cat", "Garlic found. I smell important.");
            } else if (item === "sauce") {
              const newlyFound = markIngredient(state, "sauce", "Cat", "Sauce secured. Probably.");
              if (newlyFound && !state.spillTriggered) {
                state.spillTriggered = true;
                state.postSpillIndex = 0;
                state.postSpillComplete = false;
                state.scrubProgress = 0;
                state.spongeReady = false;
                state.spillSpots = { one: false, two: false, three: false };
                state.activeMessage = postSpillDialogue[0];
              }
            }

            maybeStartFinalDialogue(state);
            saveAndRender();
            return;
          }

          if (action === "flavor") {
            setMessage(state, "Cat", button.dataset.text);
            saveAndRender();
            return;
          }

          if (action === "sponge") {
            if (state.spillTriggered && !state.postSpillComplete) {
              setMessage(state, "Owner", "We still need to acknowledge the spill first.");
              saveAndRender();
            } else if (state.spillTriggered && !state.spillCleaned) {
              state.spongeReady = true;
              setMessage(state, "Cat", "Okay. Sponge acquired.");
              saveAndRender();
            }
            return;
          }

          if (action === "clean-spot") {
            if (!state.spongeReady) {
              setMessage(state, "Owner", "Use the sponge first.");
              saveAndRender();
              return;
            }

            cleanSpillSpot(button.dataset.spot);
            return;
          }

          if (action === "continue" && state.finalComplete) {
            persistKitchenState(state);
            goToScene("remote");
          }
        });
      });
    },
  };
}
