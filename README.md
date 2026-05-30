# Movie Night

Movie Night is a browser-based point-and-click adventure game scaffold built with HTML, CSS, and vanilla JavaScript. This first step sets up the project foundation only: scene navigation, local save support, settings UI, placeholder scenes, and placeholder art assets.

## Project Structure

```text
movie-night-game/
├── index.html
├── styles.css
├── script.js
├── README.md
├── assets/
│   ├── backgrounds/
│   ├── cat/
│   ├── items/
│   ├── ui/
│   └── audio/
├── scenes/
│   ├── home.js
│   ├── kitchen.js
│   ├── remote.js
│   ├── login.js
│   ├── movieSelect.js
│   └── ending.js
└── save/
    └── saveManager.js
```

## Current Foundation

- Home screen with `New Game`, `Continue Game`, and `Settings`
- Placeholder scene management framework for six scenes
- Local save system using `localStorage`
- Settings menu with resume, return home, mute toggle, and reset save
- Lower-right settings shortcut and back-navigation framework
- Placeholder PNG assets for backgrounds, cat expressions, and UI

## How To Run Locally

1. Open the project folder.
2. Start a simple static server from the project root, for example:

```bash
python3 -m http.server 8000
```

3. Visit `http://localhost:8000` in your browser.

You can also open `index.html` directly, but using a local server is the safer default for module-based JavaScript.

## Future Roadmap

- Replace placeholder scenes with interactive point-and-click layouts
- Add inventory, puzzle logic, and clickable hotspots
- Add dialogue, cutscenes, and progression state
- Introduce music, sound effects, and polish animations
- Expand save data beyond the current scene
