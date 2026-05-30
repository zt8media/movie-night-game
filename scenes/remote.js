export function createRemoteScene() {
  return {
    title: "Remote Search",
    background: "assets/backgrounds/bg_livingroom.png",
    text: "Placeholder scene: the living room is a mess and the missing remote still has not surfaced.",
    actions: [{ label: "Open Streaming App", type: "goto", target: "login" }],
  };
}
