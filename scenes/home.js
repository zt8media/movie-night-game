export function createHomeScene({ hasSave, save }) {
  const shutdownMessage = "Since you hate me I am shutting down this website. I am sorry again and you know where to find me if you ever want to talk or even if you just want me to unpause the server.";

  return {
    title: "Home Screen",
    background: "assets/backgrounds/bg_livingroom.png",
    text: shutdownMessage,
    actions: [
      { label: "New Game", type: "newGame" },
      { label: "Continue Game", type: "continue", disabled: !hasSave },
      { label: "Settings", type: "settings" },
    ],
    render() {
      return `
        <section class="scene-card home-scene shutdown-home-scene" style="background-image: linear-gradient(rgba(7, 0, 0, 0.48), rgba(16, 0, 0, 0.8)), url('assets/backgrounds/bg_livingroom.png')">
          <div class="shutdown-warning-overlay" role="alert" aria-live="assertive">
            <p class="shutdown-kicker">Website Paused</p>
            <h2>Movie Night is offline</h2>
            <p>${shutdownMessage}</p>
          </div>
        </section>
      `;
    },
    setup() {},
  };
}
