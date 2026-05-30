export function createHomeScene({ hasSave, save }) {
  const homeCatMoments = [
    { image: "assets/cat/cat_think.png", thought: "Paw-corn ready. I mean popcorn." },
    { image: "assets/cat/cat_happy.png", thought: "Tonight’s feature: The Meowtrix." },
    { image: "assets/cat/cat_guilty.png", thought: "I did not hide the re-mote. Probably." },
    { image: "assets/cat/cat_idle.png", thought: "Fast & Furriest: Couch Drift." },
  ];

  const homeText = save?.completed
    ? "Movie Night Completed. Start over or continue from your latest scene."
    : "Start the Movie Night adventure or continue from the last saved scene.";

  return {
    title: "Home Screen",
    background: "assets/backgrounds/bg_livingroom.png",
    text: homeText,
    actions: [
      { label: "New Game", type: "newGame" },
      { label: "Continue Game", type: "continue", disabled: !hasSave },
      { label: "Settings", type: "settings" },
    ],
    render() {
      const actions = `
        <button type="button" data-action="newGame">New Game</button>
        <button type="button" data-action="continue" ${!hasSave ? "disabled" : ""}>Continue Game</button>
        <button type="button" data-action="settings">Settings</button>
      `;

      return `
        <section class="scene-card home-scene" style="background-image: linear-gradient(rgba(3, 9, 18, 0.25), rgba(3, 9, 18, 0.72)), url('assets/backgrounds/bg_livingroom.png')">
          <div class="scene-overlay home-overlay">
            <h2>${save?.completed ? "Movie Night Completed" : "Movie Night"}</h2>
            <p>${homeText}</p>
            <div class="scene-actions">${actions}</div>
          </div>

          <div class="home-side-cat">
            <button type="button" class="home-side-cat-trigger" data-home-cat-toggle aria-label="Switch cat mood">
              <img class="home-side-cat-image" data-home-cat-image src="${homeCatMoments[0].image}" alt="Home screen cat mood">
            </button>
            <p class="home-thought-bubble" data-home-thought>${homeCatMoments[0].thought}</p>
          </div>
        </section>
      `;
    },
    setup({ app }) {
      let catIndex = 0;
      const catButton = app.querySelector("[data-home-cat-toggle]");
      const catImage = app.querySelector("[data-home-cat-image]");
      const thoughtBubble = app.querySelector("[data-home-thought]");

      if (!catButton || !catImage || !thoughtBubble) {
        return;
      }

      const renderMoment = () => {
        const moment = homeCatMoments[catIndex];
        catImage.src = moment.image;
        thoughtBubble.textContent = moment.thought;
      };

      catButton.addEventListener("click", () => {
        catIndex = (catIndex + 1) % homeCatMoments.length;
        catButton.classList.remove("home-cat-bounce");
        void catButton.offsetWidth;
        catButton.classList.add("home-cat-bounce");
        renderMoment();
      });
    },
  };
}
