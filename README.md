# Autoscroller

Auto-scroll through the active note at a configurable pace. Useful for reading long documents hands-free or during presentations.

https://user-images.githubusercontent.com/15689774/203650814-d8bd8164-c4c5-46cd-8cfe-8207f24ff9aa.mp4

## Features

- Toggle autoscroller with a command or ribbon icon
- Increase or decrease scroll speed with commands
- Right-click the ribbon icon to cycle scroll speed
- Hide the ribbon icon in settings if you prefer commands or hotkeys (for example, with the [Commander plugin](https://github.com/phibr0/obsidian-commander/))

## Usage

1. Open a note in reading or editing mode.
2. Run **Autoscroller: Toggle scrolling** or click the ribbon icon.
3. Use **Increase speed** and **Decrease speed** commands to adjust the rate.

## Known issues

- Autoscroller stops if you activate it before focusing a note's content.

## Development

```bash
npm install
npm run dev
```

Build for release:

```bash
npm run build
npm run lint
```
