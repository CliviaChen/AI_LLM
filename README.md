# AI_LLM

我的 ai 大模型通识课作业。仓库里目前的主要产出是 DeepSeek Harness Web 客户端的「控制室」工作台插件，下面是对它的说明。

## DSH Control room

A local plugin for the DeepSeek Harness Web client: an entry pinned at the foot of the left sidebar opens a three-panel **Control room** that turns the local projects (DSH Workspaces) into liquid-glass cards.

## Features

- **Sidebar foot entry** — a row above Settings; the 56px rail shows the glyph only.
- **Three panels** — *My local projects*, *Project detail*, *Overview*; the left and right panels toggle from the header, the centre panel stays.
- **Liquid-glass cards** — layered translucent white/blue gradients, `backdrop-filter`, a masked specular rim and a soft top gloss; the canonical path is deliberately not printed on cards.
- **Running state** — while a project's Session is working, that card's rim pulses and its timestamp becomes `Running · mm:ss`; the header adds a live pill and the detail panel an elapsed row.
- **Search, copy path, open project, back to chat** — a single primary action per card, no duplicated "new session" affordance.
- **Themes** — glass alpha and rim strength follow the host color scheme through `light-dark()`; text and borders use the host `--dsw-alias-*` tokens. `prefers-reduced-motion` disables the pulse.

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
- The elapsed time of a running conversation starts when this page first observes the Session running; a reload restarts the measurement.
- Sessions are not listed individually yet.
- The panel layout is a fixed three-column composition with hide/show toggles; panels cannot be dragged or re-docked.

## Verify

```bash
node scripts/verify.mjs
```

The script loads `control-room/client.js` with a minimal React stand-in, applies the plugin to a fake slot registry, and asserts the two registrations, card rendering, running-state markup, and the stylesheet shape.

## Transcript

`conversation/2026-11-21-control-room.md` records how this was built, including the research on comparable open-source launchers. See `conversation/README.md` for moving it to another machine.

`awesome-design-md-main/` is third-party reference material and is intentionally not part of this repository.