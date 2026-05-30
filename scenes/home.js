export function createHomeScene({ hasSave }) {
  return {
    title: "Home Screen",
    background: "assets/backgrounds/bg_home.png",
    text: "Start the Movie Night adventure or continue from the last saved placeholder scene.",
    actions: [
      { label: "New Game", type: "newGame" },
      { label: "Continue Game", type: "continue", disabled: !hasSave },
      { label: "Settings", type: "settings" },
    ],
  };
}
