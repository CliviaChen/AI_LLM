window.__ModuleLoader__.load({
  id: '@local/control-room',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useEffect, useMemo, useRef, useState } = React

    const NS = 'control-room'
    const PANEL_ID = 'control-room'
    const MAX_COLUMNS = 3

    const ZH = {
      panel: '控制室',
      title: '控制室',
      running: '运行中',
      enter: '打开项目',
      emptyTitle: '还没有本地项目',
      emptyHint: '在侧边栏打开一个文件夹后，它会作为工作区登记在这里。',
      timeNow: '刚刚',
      timeMin: ' 分钟前',
      timeHour: ' 小时前',
      timeDay: ' 天前',
    }

    const EN = {
      panel: 'Control room',
      title: 'Control room',
      running: 'Running',
      enter: 'Open project',
      emptyTitle: 'No local projects yet',
      emptyHint: 'Open a folder in the sidebar and it is registered here as a workspace.',
      timeNow: 'just now',
      timeMin: 'm ago',
      timeHour: 'h ago',
      timeDay: 'd ago',
    }

    const CSS = `
@property --cr-angle{syntax:'<angle>';inherits:false;initial-value:0deg}
.cr-root{position:relative;display:flex;height:100%;min-height:0;padding:28px;box-sizing:border-box;overflow:auto;color:var(--dsw-alias-label-primary);font-family:inherit;
  background:var(--dsw-alias-bg-base,light-dark(#f5f6f8,#0d1014));
  --cr-size:clamp(116px,min(32vh,24vw),220px);
  --cr-gap:clamp(26px,4.2vmin,54px);
  --cr-glass-top:light-dark(rgba(255,255,255,.80),rgba(255,255,255,.20));
  --cr-glass-mid:light-dark(rgba(255,255,255,.46),rgba(255,255,255,.115));
  --cr-glass-low:light-dark(rgba(255,255,255,.24),rgba(255,255,255,.055));
  --cr-glass-rim:light-dark(rgba(255,255,255,.96),rgba(255,255,255,.56));
  --cr-glass-edge:light-dark(color-mix(in srgb,#2b5b96 26%,transparent),rgba(255,255,255,.22));
  --cr-tint:light-dark(color-mix(in srgb,#8ecbff 24%,transparent),color-mix(in srgb,#6aa8ff 20%,transparent));
  --cr-focus:light-dark(#0a5bd3,#8fd0ff);
  --cr-shadow:light-dark(rgba(23,58,120,.38),rgba(0,0,0,.72))}
.cr-grid{display:grid;grid-template-columns:repeat(var(--cr-cols,3),var(--cr-size));gap:var(--cr-gap);margin:auto;justify-items:stretch}
.cr-card{position:relative;isolation:isolate;box-sizing:border-box;
  width:var(--cr-size);aspect-ratio:1/1;
  display:flex;flex-direction:column;align-items:flex-start;
  padding:clamp(14px,1.6vmin,18px);
  border-radius:clamp(24px,3.4vmin,36px);
  border:1px solid var(--cr-glass-edge);
  color:inherit;font:inherit;text-align:left;cursor:pointer;
  background:
    radial-gradient(120% 92% at 18% -18%,var(--cr-glass-top),transparent 58%),
    linear-gradient(150deg,var(--cr-glass-mid),var(--cr-glass-low) 64%,var(--cr-glass-mid)),
    var(--cr-tint);
  backdrop-filter:blur(30px) saturate(180%);
  -webkit-backdrop-filter:blur(30px) saturate(180%);
  box-shadow:
    inset 0 1px 0 var(--cr-glass-rim),
    inset 0 -1px 0 light-dark(rgba(255,255,255,.62),rgba(255,255,255,.12)),
    inset 0 0 30px rgba(255,255,255,.10),
    0 40px 70px -34px var(--cr-shadow),
    0 3px 8px -4px var(--cr-shadow);
  transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease}
.cr-card::after{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:1;
  background:radial-gradient(92% 62% at 22% 0%,rgba(255,255,255,.55),transparent 62%),linear-gradient(to top,rgba(255,255,255,.14),transparent 44%);
  opacity:.6;transition:opacity .22s ease}
.cr-card::before{content:'';position:absolute;inset:0;border-radius:inherit;padding:1px;pointer-events:none;z-index:2;
  background:linear-gradient(150deg,var(--cr-glass-rim),transparent 34%,transparent 64%,color-mix(in srgb,#b7ddff 70%,transparent) 88%,var(--cr-glass-rim));
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;
  mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  mask-composite:exclude}
.cr-card:hover{transform:translateY(-4px) scale(1.012);border-color:var(--cr-glass-rim);
  box-shadow:
    inset 0 1px 0 #fff,
    inset 0 -1px 0 light-dark(rgba(255,255,255,.62),rgba(255,255,255,.12)),
    inset 0 0 34px rgba(255,255,255,.16),
    0 52px 84px -34px var(--cr-shadow),
    0 5px 12px -4px var(--cr-shadow)}
.cr-card:hover::after{opacity:.85}
.cr-card:focus-visible{outline:2px solid var(--cr-focus);outline-offset:4px}
.cr-mark{position:relative;z-index:3;display:grid;place-items:center;flex:0 0 auto;width:clamp(38px,4.6vmin,46px);aspect-ratio:1/1;
  border-radius:clamp(12px,1.5vmin,15px);color:#fff;
  background:linear-gradient(140deg,#b6e4ff,#5aa2ff 62%,#3f86ff);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.82),inset 0 -1px 0 rgba(20,70,150,.18),0 12px 22px -14px rgba(63,134,255,.95)}
.cr-name{position:relative;z-index:3;margin-top:auto;width:100%;font-size:14px;font-weight:600;line-height:1.35;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cr-status{position:relative;z-index:3;display:block;width:100%;margin-top:6px;font-size:11.5px;
  color:light-dark(var(--dsw-alias-label-secondary),color-mix(in srgb,#ffffff 84%,transparent));
  font-variant-numeric:tabular-nums;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cr-live{position:relative;z-index:3;display:inline-flex;align-items:center;gap:6px;margin-top:6px;padding:3px 9px;border-radius:999px;
  font-size:11px;font-variant-numeric:tabular-nums;
  color:light-dark(color-mix(in srgb,#0f5bb5 82%,var(--dsw-alias-label-primary)),#f2f9ff);
  background:light-dark(color-mix(in srgb,#7cc4ff 30%,transparent),color-mix(in srgb,#7cc4ff 34%,transparent));
  border:1px solid light-dark(color-mix(in srgb,#2f7fd6 44%,transparent),color-mix(in srgb,#8fd0ff 46%,transparent))}
.cr-liveDot{width:5px;height:5px;border-radius:50%;background:#2f9bff;animation:cr-dot 1.4s ease-in-out infinite}
.cr-card[data-running="true"]{border-color:color-mix(in srgb,#4d9dff 70%,var(--cr-glass-edge));animation:cr-breathe 2.6s ease-in-out infinite}
.cr-card[data-running="true"]::before{
  background:conic-gradient(from var(--cr-angle),
    transparent 0deg,transparent 208deg,
    color-mix(in srgb,#2f7dff 88%,transparent) 258deg,
    #ffffff 288deg,
    color-mix(in srgb,#0a84ff 95%,transparent) 308deg,
    transparent 336deg,transparent 360deg);
  animation:cr-flow 3.4s linear infinite}
.cr-empty{display:flex;flex-direction:column;align-items:center;gap:10px;max-width:340px;margin:auto;text-align:center}
.cr-emptyIcon{display:grid;place-items:center;width:48px;height:48px;border-radius:15px;color:color-mix(in srgb,#4d8dff 78%,var(--dsw-alias-label-primary))}
.cr-emptyTitle{font-size:13.5px;font-weight:600}
.cr-emptyHint{font-size:12px;line-height:1.6;color:var(--dsw-alias-label-secondary)}
.cr-srOnly{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0}
.cr-sideEntry{display:flex;align-items:center;gap:8px;width:100%;height:32px;padding:0 8px;border-radius:8px;border:1px solid transparent;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;cursor:pointer;text-align:left}
.cr-sideEntry:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 8%,transparent)}
.cr-sideEntry[data-active="true"]{background:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent)}
.cr-sideEntry:focus-visible{outline:2px solid light-dark(#0a5bd3,#8fd0ff);outline-offset:1px}
.cr-sideEntry[data-rail="true"]{justify-content:center;padding:0}
.cr-sideIcon{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:16px;height:16px;color:color-mix(in srgb,#4d8dff 70%,var(--dsw-alias-label-primary))}
.cr-sideLabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@keyframes cr-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.78)}}
@keyframes cr-flow{from{--cr-angle:0deg}to{--cr-angle:360deg}}
@keyframes cr-breathe{
  0%,100%{box-shadow:inset 0 1px 0 var(--cr-glass-rim),inset 0 -1px 0 light-dark(rgba(255,255,255,.62),rgba(255,255,255,.12)),inset 0 0 30px rgba(255,255,255,.10),0 40px 70px -34px var(--cr-shadow),0 3px 8px -4px var(--cr-shadow),0 0 0 1px color-mix(in srgb,#7cc4ff 18%,transparent)}
  50%{box-shadow:inset 0 1px 0 var(--cr-glass-rim),inset 0 -1px 0 light-dark(rgba(255,255,255,.62),rgba(255,255,255,.12)),inset 0 0 34px rgba(255,255,255,.16),0 40px 70px -34px var(--cr-shadow),0 3px 8px -4px var(--cr-shadow),0 0 0 3px color-mix(in srgb,#7cc4ff 30%,transparent),0 0 30px -6px color-mix(in srgb,#6db4ff 62%,transparent)}}
@media (prefers-reduced-motion: reduce){
  .cr-card,.cr-card[data-running="true"],.cr-card[data-running="true"]::before,.cr-liveDot{animation:none}
  .cr-card:hover{transform:none}}
`

    function Styles() {
      return h('style', { 'data-control-room-style': '' }, CSS)
    }

    function Icon({ size }) {
      const edge = size || 16
      return h('svg', {
        width: edge, height: edge, viewBox: '0 0 16 16', fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
        h('rect', { x: 1.8, y: 1.8, width: 5.2, height: 5.2, rx: 1.4 }),
        h('rect', { x: 9, y: 1.8, width: 5.2, height: 5.2, rx: 1.4, opacity: 0.55 }),
        h('rect', { x: 1.8, y: 9, width: 5.2, height: 5.2, rx: 1.4, opacity: 0.55 }),
        h('rect', { x: 9, y: 9, width: 5.2, height: 5.2, rx: 1.4 }),
      )
    }

    /** Vector mark that replaces the letter monogram at the card's top-left. */
    function ProjectMark({ size }) {
      const edge = size || 22
      return h('svg', {
        width: edge, height: edge, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
        h('rect', { x: 3.4, y: 3.4, width: 7.5, height: 7.5, rx: 2.2 }),
        h('rect', { x: 13.1, y: 3.4, width: 7.5, height: 7.5, rx: 2.2, opacity: 0.62 }),
        h('rect', { x: 3.4, y: 13.1, width: 7.5, height: 7.5, rx: 2.2, opacity: 0.62 }),
        h('rect', { x: 13.1, y: 13.1, width: 7.5, height: 7.5, rx: 2.2 }),
      )
    }

    function timeAgo(iso, t) {
      const then = Date.parse(iso)
      if (!Number.isFinite(then)) return ''
      const diff = Date.now() - then
      const minutes = Math.floor(diff / 60000)
      if (minutes < 1) return t('timeNow')
      if (minutes < 60) return String(minutes) + t('timeMin')
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return String(hours) + t('timeHour')
      const days = Math.floor(hours / 24)
      if (days < 30) return String(days) + t('timeDay')
      return new Date(then).toLocaleDateString()
    }

    function formatDuration(ms) {
      const total = Math.max(0, Math.floor(ms / 1000))
      const hours = Math.floor(total / 3600)
      const minutes = Math.floor((total % 3600) / 60)
      const seconds = total % 60
      const pad = (value) => String(value).padStart(2, '0')
      return hours > 0 ? String(hours) + ':' + pad(minutes) + ':' + pad(seconds) : pad(minutes) + ':' + pad(seconds)
    }

    function ProjectCard(props) {
      const { workspace, t, now, runningStart, onOpen } = props
      const running = runningStart !== null && runningStart !== undefined
      const status = running
        ? t('running') + ' · ' + formatDuration(now - runningStart)
        : timeAgo(workspace.updatedAt, t)
      return h('button', {
        type: 'button',
        className: 'cr-card',
        'data-running': running ? 'true' : 'false',
        title: workspace.title + ' — ' + t('enter'),
        'aria-label': workspace.title + ' · ' + status + ' · ' + t('enter'),
        onClick: onOpen,
      },
        h('span', { className: 'cr-mark', 'aria-hidden': 'true' }, h(ProjectMark, { size: 22 })),
        h('span', { className: 'cr-name' }, workspace.title),
        running
          ? h('span', { className: 'cr-live' },
            h('span', { className: 'cr-liveDot', 'aria-hidden': 'true' }),
            status,
          )
          : h('span', { className: 'cr-status' }, status),
      )
    }

    function ControlRoomPage(props) {
      const t = props.t || ((key) => key)
      const snapshot = props.useWorkspaces((value) => value)
      const workspaces = (snapshot && snapshot.items) || []
      const useSessions = props.useSessions || ((selector) => selector(null))
      const sessionState = useSessions((value) => value)
      const [now, setNow] = useState(() => Date.now())
      const startsRef = useRef({})

      const byId = (sessionState && sessionState.byId) || {}
      const runningKey = Object.keys(byId).filter((id) => byId[id] && byId[id].running).sort().join('|')

      useEffect(() => {
        const timer = window.setInterval(() => { setNow(Date.now()) }, 1000)
        return () => { window.clearInterval(timer) }
      }, [])

      useEffect(() => {
        const next = {}
        const stamp = Date.now()
        const ids = runningKey === '' ? [] : runningKey.split('|')
        for (const id of ids) next[id] = startsRef.current[id] || stamp
        startsRef.current = next
      }, [runningKey])

      const runningIds = useMemo(() => new Set(runningKey === '' ? [] : runningKey.split('|')), [runningKey])

      const runningByWorkspace = useMemo(() => {
        const map = {}
        for (const workspace of workspaces) {
          const ids = (workspace.sessionIds || []).filter((id) => runningIds.has(id))
          if (ids.length === 0) continue
          const stamps = ids.map((id) => startsRef.current[id] || now)
          map[workspace.workspaceId] = Math.min.apply(null, stamps)
        }
        return map
      }, [workspaces, runningKey, now])

      // Status cards only: running projects first, then the most recently updated.
      // Every project is rendered; the grid wraps into further rows instead of dropping any.
      const ordered = useMemo(() => {
        const rank = (workspace) => Object.prototype.hasOwnProperty.call(runningByWorkspace, workspace.workspaceId) ? 0 : 1
        return workspaces.slice().sort((left, right) => {
          const byRank = rank(left) - rank(right)
          if (byRank !== 0) return byRank
          return Date.parse(right.updatedAt) - Date.parse(left.updatedAt)
        })
      }, [workspaces, runningKey])

      // Until the workspace list has actually arrived, show nothing rather than a false empty state.
      if (snapshot && !Array.isArray(snapshot.items)) {
        return h('div', { className: 'cr-root' }, h(Styles))
      }

      if (ordered.length === 0) {
        return h('div', { className: 'cr-root' },
          h(Styles),
          h('h1', { className: 'cr-srOnly' }, t('title')),
          h('div', { className: 'cr-empty' },
            h('span', { className: 'cr-emptyIcon', 'aria-hidden': 'true' }, h(Icon, { size: 26 })),
            h('span', { className: 'cr-emptyTitle' }, t('emptyTitle')),
            h('span', { className: 'cr-emptyHint' }, t('emptyHint')),
          ),
        )
      }

      // Three columns at most; a short last row starts at the left edge of the grid.
      const columns = Math.min(MAX_COLUMNS, ordered.length)

      return h('div', { className: 'cr-root' },
        h(Styles),
        h('h1', { className: 'cr-srOnly' }, t('title')),
        h('div', {
          className: 'cr-grid',
          style: { '--cr-cols': String(columns) },
        },
          ordered.map((workspace) => h(ProjectCard, {
            key: workspace.workspaceId,
            workspace,
            t,
            now,
            runningStart: Object.prototype.hasOwnProperty.call(runningByWorkspace, workspace.workspaceId)
              ? runningByWorkspace[workspace.workspaceId]
              : null,
            onOpen: () => { props.openProject(workspace.workspaceId) },
          })),
        ),
      )
    }

    function SidebarEntry(props) {
      const wide = props.wide !== false
      // Prefer the live locale seat so a language switch after load is reflected here too.
      const label = typeof props.t === 'function'
        ? props.t('panel')
        : typeof props.label === 'function'
          ? props.label()
          : (props.label || NS)
      const panelInfo = typeof props.usePanelInfo === 'function' ? props.usePanelInfo((value) => value) : null
      const active = Boolean(panelInfo && panelInfo.activePanelId === PANEL_ID)
      return h(React.Fragment, null,
        h(Styles),
        h('button', {
          type: 'button',
          className: 'cr-sideEntry',
          'data-rail': wide ? 'false' : 'true',
          'data-active': active ? 'true' : 'false',
          'aria-current': active ? 'page' : undefined,
          title: label,
          'aria-label': label,
          onClick: () => { props.open() },
        },
          h('span', { className: 'cr-sideIcon' }, h(Icon, { size: 16 })),
          wide ? h('span', { className: 'cr-sideLabel' }, label) : null,
        ),
      )
    }

    return {
      inject: ['slots', 'locale', 'layout', 'uiWorkspace'],
      apply(ctx) {
        ctx.effect(
          () => ctx.locale.register(NS, { zh: ZH, en: EN }),
          'control-room: dictionaries',
        )
        const t = ctx.locale.bind(NS)

        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: PANEL_ID,
          locale: NS,
          inject: () => ({
            openProject: (workspaceId) => {
              try {
                const opening = ctx.uiWorkspace.openWorkspace(workspaceId)
                if (opening && typeof opening.catch === 'function') opening.catch(() => {})
              } catch (_error) {}
            },
          }),
        }, ControlRoomPage))

        ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
          name: 'sidebar.footer.action',
          id: PANEL_ID,
          order: 10,
          locale: NS,
          inject: () => ({
            label: t('panel'),
            open: () => {
              try {
                ctx.layout.selectPanel(PANEL_ID)
              } catch (_error) {}
            },
          }),
        }, SidebarEntry))
      },
    }
  },
})
