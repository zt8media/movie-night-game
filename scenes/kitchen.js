export function createKitchenScene() {
  return {
    title: "Kitchen",
    background: "assets/backgrounds/bg_kitchen.png",
    text: "Placeholder scene: the night begins in the kitchen while snacks are being assembled.",
    actions: [{ label: "Look For The Remote", type: "goto", target: "remote" }],
  };
}
