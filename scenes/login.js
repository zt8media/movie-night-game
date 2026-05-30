export function createLoginScene() {
  return {
    title: "Streaming Login",
    background: "assets/backgrounds/bg_livingroom.png",
    text: "Placeholder scene: the TV is on, but the app wants credentials before the movie can start.",
    actions: [{ label: "Choose A Movie", type: "goto", target: "movieSelect" }],
  };
}
