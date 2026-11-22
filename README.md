# AI_LLM

我的 ai 大模型通识课作业。仓库里目前的主要产出是 DeepSeek Harness Web 客户端的「控制室」工作台插件，下面是对它的说明。

## DSH Control room

A local plugin for the DeepSeek Harness Web client: an entry pinned at the foot of the left sidebar opens a **Control room** that shows the local projects (DSH Workspaces) as a quiet row of liquid-glass status cards.

## Features

- **Sidebar foot entry** — a row above Settings; the 56px rail shows the glyph only.
- **Status cards only** — opening the page shows nothing but project cards: no title bar, no statistics, no detail or overview panel, no search field. Clicking a card opens that project.
- **Three per row, as many rows as needed** — every project gets a card; running ones come first, then the rest by update time. The grid wraps into further rows, and a short last row starts at the left edge instead of centring.
- **Rounded-square glass cards** — square cards with large gaps over a flat host-colored background, carrying a backdrop-blurred translucent fill, a masked specular rim and a deep soft shadow so each card reads as floating.
- **Vector mark** — the light-blue badge at each card's top-left holds a drawn glyph instead of a letter monogram.
- **Running state** — while a project's Session is working, that card's 1px rim carries a rotating conic light sweep, its fill breathes, and the timestamp becomes `Running · mm:ss`. `prefers-reduced-motion` disables both.

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
- The elapsed time of a running conversation starts when this page first observes the Session running; a reload restarts the measurement.
- Sessions are not listed individually.
- The page has no search, no panel toggles and no back button: leave it through the sidebar.

## Verify

```bash
node scripts/verify.mjs
```

The script loads `control-room/client.js` with a minimal React stand-in, applies the plugin to a fake slot registry, and asserts the two registrations, that every project is rendered, the three-column cap and row ordering (including a short last row), card rendering and click action, the absence of the former chrome, the running-state markup, and the stylesheet shape.

## Transcript

`conversation/2026-11-21-control-room.md` records how this was built, including the research on comparable open-source launchers. See `conversation/README.md` for moving it to another machine.

`awesome-design-md-main/` is third-party reference material and is intentionally not part of this repository.