# Control room

A single screen of status cards for the local projects (DSH Workspaces) of this installation, opened from an action at the foot of the left sidebar.

## What it does

- **Sidebar foot entry** — a row above Settings. In the 56px rail it shows the glyph only; hovering shows the label.
- **Cards only** — the page renders project cards and nothing else: no header, no counters, no detail or overview panel, no search field, no back button. Leaving the page is done from the sidebar.
- **Three cards per row** — projects whose Session is running come first, then the rest by update time. Every project gets a card; the grid wraps into as many rows as needed, and a short last row starts at the left edge of the grid rather than centring.
- **Open a project** — the whole card is one button that opens its Workspace. There is no secondary action.
- **Running conversation** — while a project's Session is working, the card's rim carries a rotating conic light sweep, the card's fill breathes once every 2.6s, and its timestamp is replaced by `Running · mm:ss`. Time starts when the page first observes the Session running.

## Visual language

Cards are rounded squares (`aspect-ratio: 1/1`) sized from the viewport, laid out in a grid of at most three columns with a wide gap, and centred on a flat, single-color host background — the former dot grid and colored aura are gone. The grid container sizes itself to the columns in use, so one or two cards still sit centred on the page; from the fourth card on the column count stays at three and the extra rows fill left to right.

Each card is translucent glass: layered white gradients over `backdrop-filter: blur(30px) saturate(180%)`, a 1px masked specular rim, a soft top gloss, and a deep low-opacity shadow beneath it, so the card reads as floating above the surface. The page background and all text use host tokens (`--dsw-alias-bg-base`, `--dsw-alias-label-primary/secondary`); the glass fill, rim, tint and shadow are theme-aware literals switched with `light-dark()`, because they describe a material rather than a role. In light mode the fill carries a pale blue tint and a blue-grey border so the card still separates from the near-white page; the blur itself is not observable over a flat background and the float is carried by the tint, rim and shadow.

Because the page holds no header, the panel carries a visually hidden `<h1>` so the page still has a name for screen readers.

The badge at the card's top-left is a light-blue rounded square holding a white vector glyph (a 2×2 rounded grid) instead of the former letter monogram.

The running rim is a `conic-gradient` whose `--cr-angle` is animated with an `@property`-registered custom property, masked to the card's 1px border, with saturated blue stops so it stays visible on the light theme; a separate `cr-breathe` shadow animation runs on the card itself. `prefers-reduced-motion: reduce` disables the sweep, the breathe, the dot, and the hover lift.

## Usage

1. Open **Control room** from the action above Settings in the left sidebar.
2. Pick a card; its click calls `uiWorkspace.openWorkspace`, which opens that project and — because the host ends that call with `selectPanel(null)` — returns the main area to the conversation.
3. Use the sidebar to leave the page; every project is already on it.

## Limitations

- Projects are the Workspaces already registered in DSH; this page does not scan the filesystem, create Workspaces, or remove them — do that in the sidebar.
- The grid is capped at three columns, not at three cards: many projects make the page scroll, and it has no search or pagination.
- Sessions are not listed individually: a card reads only its Workspace title, running state and update time.
- The elapsed time for a running conversation is measured from the moment this page observes it running; a reload restarts that measurement, and the value is not read from the Session log.
- The page carries no navigation controls of its own; it is a panel reached from, and left through, the sidebar.
