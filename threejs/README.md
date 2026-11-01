# Untitled Game

![Untitled Game banner](.arcadible/banner.png)

## A memorable tagline.

A brief, plain-text pitch for your game, in a sentence or two. It's shown when your game is featured, and in About when there's no description below.

---

Tell players about your game here. This section becomes your game's description. It appears in the **About** section on the store page. Expand on your game, highlight its features, embed [PNGs and MP4s](https://developer.arcadible.com/references/arcadible-markdown#media) from the .arcadible/gallery directory, and format your description with [Arcadible Markdown](https://developer.arcadible.com/references/arcadible-markdown).

---

Everything after the last horizontal rule is ignored by Arcadible. Use this section for development notes, build instructions, or other repository documentation.

For larger projects, you can instead create an `arcadible.md` file to keep your store page content separate from your repository's `README.md`.

## Develop

The game is built with [Three.js](https://threejs.org/docs/) and [Vite](https://vite.dev), into `.arcadible-public/`.

```sh
npm install
npm run dev     # a local server that reloads as you edit
arc serve       # the build, served as Arcadible does
arc deploy      # builds, then publishes
```

The version in `package.json` starts as a prerelease, `0.1.0-beta.1`, so `arc deploy` publishes to staging: a link to play and share. Release `0.1.0` when you're ready to give the game its store page.

### References

- [Arcadible Manifest](https://developer.arcadible.com/references/arcadible-manifest)
  - [game.title](https://developer.arcadible.com/references/arcadible-manifest#game.title)
  - [game.tagline](https://developer.arcadible.com/references/arcadible-manifest#game.tagline)
  - [game.bio](https://developer.arcadible.com/references/arcadible-manifest#game.bio)
  - [game.description](https://developer.arcadible.com/references/arcadible-manifest#game.description)
  - [game.gallery](https://developer.arcadible.com/references/arcadible-manifest#game.gallery)
