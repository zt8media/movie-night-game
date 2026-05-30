export function createHomeScene({ hasSave, save }) {
  return {
    title: "Home Screen",
    background: "assets/backgrounds/bg_livingroom.png",
    text: save?.completed
      ? "Movie Night Completed. Start over or continue from your latest scene."
      : "Start the Movie Night adventure or continue from the last saved placeholder scene.",
    actions: [
      { label: "New Game", type: "newGame" },
      { label: "Continue Game", type: "continue", disabled: !hasSave },
      { label: "Settings", type: "settings" },
    ],
  };
}
