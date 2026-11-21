# Control room

A multi-panel bench for the local projects (DSH Workspaces) of this installation, opened from an action at the foot of the left sidebar.

## What it does

- **Sidebar foot entry** — a row above Settings. In the 56px rail it shows the glyph only; hovering shows the label.
- **Control room page** — opens in the main column, beside the conversation rather than replacing the navigation.
- **My local projects** — one glass card per registered Workspace with its title, its session count, and its last update; search filters by title or path. The canonical path is not printed on the cards.
- **Running conversation** — while a project's Session is working, that card keeps a slowly pulsing rim and replaces its timestamp with `Running · mm:ss`; the page header adds a live pill with the elapsed time, and the detail panel gains an elapsed row. Time starts when the page first observes the Session running.
- **Project detail** — path, session count, created and updated instants, plus **Open project** and **Copy path**.
- **Overview panel** — the three most recently updated projects and a short note about where the data comes from.
- **Panel toggles** — hide or show the projects panel and the overview panel from the header; the centre detail panel always stays.

## Visual language

Cards follow an Apple-style liquid-glass treatment: layered translucent white and light-blue gradients over `backdrop-filter: blur(22px) saturate(185%)`, a masked gradient rim that reads as a specular edge, a soft top-left highlight, and a deep low-opacity shadow. Glass alpha and rim strength switch with the host color scheme through `light-dark()`, while text, borders, and states stay on the host `--dsw-alias-*` tokens. The page adds a faint dot grid and a blue/violet aura behind the content.

## Usage

1. Open **Control room** from the action above Settings in the left sidebar.
2. Pick a project card to inspect it; **Open project** connects the Workspace and opens its Session.
3. **Back to chat** in the header returns to the conversation.

## Limitations

- Projects are the Workspaces already registered in DSH; this page does not scan the filesystem, create Workspaces, or remove them — do that in the sidebar.
- Sessions are not listed individually: cards and the detail panel read counts and update times from the Workspace records.
- The elapsed time for a running conversation is measured from the moment this page observes it running; a reload restarts that measurement, and the value is not read from the Session log.
- `Copy path` uses the browser clipboard and falls back to a temporary textarea when the Clipboard API is unavailable.
- The panel layout is a fixed three-column composition with hide/show toggles; panels cannot be dragged or re-docked yet.
