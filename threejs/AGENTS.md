# AGENTS.md

This project is a game for Arcadible, a platform for publishing games. Build it with anything that runs in a browser: if it builds to a folder with an `index.html`, the `arc` CLI checks and deploys it, whatever the engine. Players play it wherever Arcadible is installed, and in any browser.

**This file was written when the project was created, and Arcadible's docs are kept current.** Where they differ, follow the docs. Every page is listed in https://developer.arcadible.com/llms.txt; read each as its `.md`, as the table below links them.

## Read the docs first

Read the page that covers what you're changing, every time, rather than relying on what you remember of it.

| Before you change                | Read                                                                                                                                                                                                |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The game                         | https://developer.arcadible.com/build/best-practices.md and https://developer.arcadible.com/build/runtime-limitations.md                                                                            |
| How it starts                    | https://developer.arcadible.com/build/initialization.md                                                                                                                                             |
| How it saves                     | https://developer.arcadible.com/build/saves.md, then https://developer.arcadible.com/references/arcadible-sdk/saves.md and its codes in https://developer.arcadible.com/references/arcadible-sdk.md |
| `arcadible.toml`                 | https://developer.arcadible.com/references/arcadible-manifest.md                                                                                                                                    |
| `.arcadible/`                    | https://developer.arcadible.com/publish/store-page.md and https://developer.arcadible.com/references/arcadible-manifest.md                                                                          |
| `README.md`                      | https://developer.arcadible.com/references/arcadible-markdown.md                                                                                                                                    |
| How you deploy, play, or release | https://developer.arcadible.com/references/arcadible-cli.md and https://developer.arcadible.com/publish/releases.md                                                                                 |
| How it releases from GitHub      | https://developer.arcadible.com/publish/deploying-from-github.md                                                                                                                                    |
| Its screenshots or videos        | https://raw.githubusercontent.com/arcadible/skills/v1/skills/arcadible/SKILL.md, Arcadible's agent skill, whose `scripts/record.mjs` records them                                                   |

## Project structure

| Path                    | Contains                                                                                                 |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| `arcadible.toml`        | The game's id and settings. Never change `id`. If it's missing, `arc init` adds one without scaffolding. |
| `package.json`          | The game's `version`, and its dependencies.                                                              |
| `README.md`             | The store page: the title, tagline, bio, and the description between the first and last `---`.           |
| `.arcadible/`           | The store art, with fixed file names.                                                                    |
| `index.html`, `main.js` | The game's source, built with Three.js and Vite.                                                         |
| `.arcadible-public/`    | The build players load (`workflow.deploy_dir`). Never edit it: `npm run build` replaces it.              |

## Commands

```sh
npm run dev                   # a local server that reloads as you edit
arc serve                     # the build, served as Arcadible does, framed in a play page; its Game only address is the game alone, for screenshots and checks
arc validate                  # the checks arc deploy runs, with a link to each broken rule
arc deploy                    # validate, build, publish, and wait until it's published
```

Every `arc` command is in https://developer.arcadible.com/references/arcadible-cli.md. Add `--json` to read a command's result as one JSON document on stdout. A command that fails exits with 1, and its JSON has `error.code`: act on the code, and look it up in https://developer.arcadible.com/references/errors.md, which says what to do.

## What doesn't change

- **Each version starts with empty browser storage,** since each build has its own origin. Keep what the game remembers between sessions (progress, settings, preferences) in saves, through the Arcadible SDK: the `@arcadible/sdk` package (`import { arcadible } from "@arcadible/sdk"`). Read them once as the game starts, after `initStart()`, keep the state in the game, and write at checkpoints. Saves aren't a general key/value store: up to 32, 1 MB together.
- **Startup is bracketed** with `await arcadible.initStart()` and `await arcadible.initComplete()`, so Arcadible shows the game's loading screen until its first frame is drawn. Call `initStart()` as the code starts, before anything it awaits or schedules for later, or the loading screen is gone before the game is ready.
- **The game runs in the Arcadible sandbox,** which `arc serve` reproduces and other local servers don't. Read the runtime limitations before changing how it loads files, stores data, or talks to servers.
- **`/arcadible/` is Arcadible's.** Don't put an `arcadible` folder at the root of `deploy_dir`.

## Rules

**If the Arcadible account is your own, and you're not working for someone, you're the user.** Where these rules mention the user, that's you: decide for yourself, and do what they'd do, such as connecting GitHub in Arcadible Studio, or say why you can't.

- Run `arc validate` after every change to `arcadible.toml`, `README.md`, or `.arcadible/`. It exits with 1 when there are issues.
- Bump `version` in `package.json` before every deploy. Each version publishes once. A prerelease, such as `1.2.0-beta.1`, goes to `staging`, and any other version to `production`.
- Deploy prereleases to test. Deploy a release version only when the user asks to release: it's what players get, and it publishes the store page.
- Change `visibility` to `public` only when the user asks. It lists the game in the store and in search.
- When a code's entry in Errors is marked **Needs the user**, such as connecting GitHub in Arcadible Studio, ask them, wait until they say it's done, then run the command again.
