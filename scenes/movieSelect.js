export function createMovieSelectScene() {
  return {
    title: "Movie Selection",
    background: "assets/backgrounds/bg_movie_select.png",
    text: "Placeholder scene: rows of unwatched choices fill the screen while the cat waits for a decision.",
    actions: [{ label: "Finish Placeholder Flow", type: "goto", target: "ending" }],
  };
}
