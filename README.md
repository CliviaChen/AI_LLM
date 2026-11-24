# AI_LLM

我的 ai 大模型通识课作业。仓库里目前的主要产出是 DeepSeek Harness Web 客户端的「控制室」工作台插件，下面是对它的说明。

## DSH Control room

A local plugin for the DeepSeek Harness Web client: an entry pinned at the foot of the left sidebar opens a **Control room** that shows the local projects (DSH Workspaces) as a quiet row of liquid-glass status cards.

## Features

- **Sidebar foot entry** — a row above Settings; the 56px rail shows the glyph only.
- **Project cards** — a card is a project. Clicking it opens the project's **cockpit**, not the conversation.
- **Three per row, as many rows as needed** — every project gets a card, ordered *needs you → running → idle, then most recently updated*; the grid wraps and a short last row starts at the left edge.
- **Three states** — `idle`, `running`, and `waiting` (the host's pending approval / plan review / question). Waiting wins over running. Both active states pulse the hard shadow in fluorescent lime; waiting also takes a lime outline, and the two use a square vs round dot so the state never relies on colour alone.
- **Stage colours** — five stages, each a static colour block plus a tinted card: unset (dashed neutral), idea (cyan), active (amber), review (hot pink), delivered (ink). **Lime is deliberately not a stage colour** — it stays reserved for the running / needs-you pulse, so a still colour block can never be mistaken for activity.
- **"Do next" bar** — up to three cards chosen by: needs you → due today/tomorrow → due this week → running → touched this week, each with the reason spelled out.
- **Project cockpit** — four views behind every card:
  - *Overview* — stage, deadline and a one-line next step.
  - *Board* — sessions, tasks done, days to deadline, last activity, plus a 14-day activity chart and a task progress bar.
  - *Tasks* — add, complete and delete, with a progress bar.
  - *Sessions* — every session of the project; clicking one opens that exact session (`uiWorkspace.openSession`), falling back to the workspace when the host declines.
- **"Open chat" stays explicit** — the conversation is one button away in the cockpit header, so browsing a project never interrupts a chat.
- **Right-click a card** — a menu with **rename workspace**, archive, hide, and "session stars and notes". Rename opens a dialog and writes through to the real workspace record, so the sidebar entry changes too (not just this card). Archived/hidden projects leave the grid and the focus bar; a single line below the grid brings them back and flags them.
- **Session stars and notes** — in the cockpit's *Sessions* view each row carries a star and a per-session note, so "the run that worked" is findable later.
- **Clock** — the panel's top-right shows hour:minute at display size, with the date and the system weekday beside it in tracked caps.
- **Records drawer** — bottom-left. Switch between day / week / month to see projects delivered in the window, sessions, token usage, and a **peak window ranked by tokens**: the busiest three consecutive hours (day), the busiest day (week), or the busiest Monday-to-Sunday week (month). The same numbers export as a Markdown report (copy or download). When the Host exposes no hourly/daily/weekly breakdown, the peak tile is removed rather than left empty.
- **Token tile is clickable and now shows real numbers** — the bundle's **Host half** (`index.js` + `usage.js`) reads DSH session logs (`<dsh home>/sessions/**/session.v4.jsonl.zstd`, concatenated zstd frames) and sums every `data.message.usage`, reporting **net (input + output)** and **total (incl. cache)**. It also reads the account balance through `deepseekAccount.getBalance` and serves both over one exact Fetch route, `GET /api/control-room-usage?scale=day|week|month`, which Connection fences to the owner Peer (403 otherwise). The dialog shows both figures, the metered record count and the balance. The route needs a DSH restart to load.
- **Memphis tile grid** — square cards set square to the page, with a hard 2px outline, a 9px zero-blur offset shadow and a deliberately wide gap, on a flat host-coloured background with a faint dot grid bleeding past the padding.
- **Fluorescent accents** — hot pink mark, fluorescent lime for anything that needs you; paper, outline and shadow are `light-dark()` pairs so both host themes stay legible.
- **Vector mark** — the magenta badge at each card's top-left holds a drawn glyph instead of a letter monogram.
- **Reduced motion** — `prefers-reduced-motion` stops the pulse and the hover lift.

## Layout

```
control-room/            the installable bundle
  package.json           bundle manifest (dsh.bundle.patch + dsh.client)
  cordis.patch.yml       loader row
  index.js               host half (no-op)
  client.js              the whole Web UI, hand-written React without JSX
  locale/en.json         plugin manager title + description
  locale/zh.json
  icon.svg
  docs/DETAIL.md         behaviour notes and limitations
conversation/            read-only transcript of the development session
scripts/verify.mjs       offline structural check, no dependencies
```

## Install

1. In DSH open **Plugins** → **Add plugin**, and pick the absolute path of the `control-room` directory.
2. Refresh the page. The entry appears at the foot of the left sidebar, above Settings.
3. The bundle is installed as a directory link, so editing `client.js` takes effect on refresh; a DSH upgrade that renames slots needs an adaptation.

Command-line equivalent, when `plugin_manager` is available to an agent: `install_bundle` with the absolute directory as target.

## Data and limits

- Projects are the Workspaces already registered in DSH; the page does not scan the filesystem or create/remove Workspaces.
- Every project is rendered. The grid is three columns wide and grows downward; when the row count exceeds the panel height the page scrolls.
- Stage, deadline, next step and tasks are stored in the browser's `localStorage` under `control-room:meta`; they do not sync across devices and are lost with site data.
- States come from the host: `running` from the Session record, `waiting` from `pendingInteraction` (`approval`, `plan-review`, `question`).
- The board counts sessions per day from their update times; the host exposes no durations, so none are estimated. Token numbers come from the Host's session-log scan, not from the board.
- Token counts are read from `<dsh home>/sessions/**/session.v4.jsonl.zstd` on the Host and served over `/api/control-room-usage`. A Host change does not hot-reload; toggle the plugin row in **Plugins** (or restart DSH) to load it. Activation is recorded in `<dsh home>/control-room-host.json`.
- Account balance comes from `deepseekAccount.getBalance`; the service exposes no token-history query.
- The elapsed time of a running conversation starts when this page first observes the Session running; a reload restarts the measurement.
- The page has no search and no panel toggles: leave it through the sidebar.

- Rename is **not** local metadata like stage or deadline: it calls the Host's `workspaceController.rename({ workspaceId, title })`, so the sidebar updates. The Host route rejects blank titles and duplicate names the way the sidebar rename does.

## Verify

```bash
node scripts/verify.mjs        # client half: renders the panel and drives it with clicks
node scripts/verify-host.mjs   # host half: imports index.js and calls the registered route
node control-room/usage.js 30  # prints the token totals the Host route would return
```

`verify.mjs` loads `control-room/client.js` with a tiny hook runtime, applies the plugin to a fake slot registry, and drives it: card click opens the cockpit, tasks persist, the session list opens the right session, the context menu archives, the records drawer exports, and the token tile consumes a stubbed Host response.

`verify-host.mjs` imports `control-room/index.js` with a fake Cordis context, captures the exact Fetch route, and calls it against the real session logs on this machine. It asserts the route path and method, a 200 payload, both token figures, the account balance, and that a one-day window never exceeds a one-week window.

`usage.js` is the scanner itself and runs standalone as a self check.

## Transcript

`conversation/2026-11-21-control-room.md` records how this was built, including the research on comparable open-source launchers. See `conversation/README.md` for moving it to another machine.

`awesome-design-md-main/` is third-party reference material and is intentionally not part of this repository.