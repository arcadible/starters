<p align="center">
  <a href="https://arcadible.com">
    <img src="https://adn-arcadible.imgix.net/images/i18n/core/www/appicon-512.png?w=256" alt="Arcadible" height="96">
  </a>
</p>

<h1 align="center">Arcadible Starters</h1>

<p align="center">
  Start a game that's ready to publish.
</p>

<p align="center">
  <a href="https://developer.arcadible.com/build/game-engines#starter-templates">Docs</a> ·
  <a href="https://developer.arcadible.com/getting-started">Getting Started</a> ·
  <a href="https://arcadible.com">Arcadible</a> ·
  <a href="https://studio.arcadible.com">Studio</a>
</p>

<br>

The templates [`arc init`](https://developer.arcadible.com/references/arcadible-cli/arc-init) creates games from, one folder each. Every starter is a complete project that deploys as it is, and keeps a save across updates through the [Arcadible SDK](https://developer.arcadible.com/build/saves).

| Folder                   | Stack        | Create it                                             |
| ------------------------ | ------------ | ----------------------------------------------------- |
| [`blank`](blank)         | Blank canvas | `arc init star-drift -y`                              |
| [`threejs`](threejs)     | Three.js     | `arc init star-drift -t arcadible/starters/threejs`   |
| [`phaser`](phaser)       | Phaser       | `arc init star-drift -t arcadible/starters/phaser`    |
| [`pixijs`](pixijs)       | PixiJS       | `arc init star-drift -t arcadible/starters/pixijs`    |
| [`babylonjs`](babylonjs) | Babylon.js   | `arc init star-drift -t arcadible/starters/babylonjs` |

`arc init` copies only the folder, without this repository's history or its `LICENSE`, so the game is yours to license.
