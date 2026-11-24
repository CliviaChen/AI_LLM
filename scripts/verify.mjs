#!/usr/bin/env node
/**
 * Offline structural + behavioural check for the Control room bundle.
 * Loads client.js with a tiny hook runtime, applies the plugin to a fake slot
 * registry, renders the page, and drives it with simulated clicks.
 * No dependencies; run with `node scripts/verify.mjs`.
 */
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const source = fs.readFileSync(path.join(root, 'control-room', 'client.js'), 'utf8')

// ---------------------------------------------------------------- hook runtime
const FRAGMENT = Symbol('Fragment')
let slots = new Map()
let activeComponent = null
let cursor = 0
let rerender = () => {}

const React = {
  Fragment: FRAGMENT,
  createElement(type, props, ...children) {
    return { type, props: props || {}, children: children.flat(Infinity) }
  },
  useState(initial) {
    const list = slots.get(activeComponent)
    const index = cursor++
    if (!(index in list)) list[index] = typeof initial === 'function' ? initial() : initial
    const set = (value) => {
      list[index] = typeof value === 'function' ? value(list[index]) : value
      rerender()
    }
    return [list[index], set]
  },
  useMemo(factory) {
    cursor++
    return factory()
  },
  useRef(initial) {
    const list = slots.get(activeComponent)
    const index = cursor++
    if (!(index in list)) list[index] = { current: initial }
    return list[index]
  },
  useEffect() {
    cursor++
  },
}

function withHooks(component, run) {
  if (!slots.has(component)) slots.set(component, [])
  const previousComponent = activeComponent
  const previousCursor = cursor
  activeComponent = component
  cursor = 0
  try {
    return run()
  } finally {
    activeComponent = previousComponent
    cursor = previousCursor
  }
}

/** Resolve function components into a host-node tree. */
function expand(node) {
  if (node === null || node === undefined || typeof node === 'boolean') return null
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(expand).filter((item) => item !== null)
  if (typeof node.type === 'function') {
    if (node.type === FRAGMENT) return expand(node.children)
    const props = { ...node.props }
    if (node.children.length > 0) props.children = node.children
    return withHooks(node.type, () => expand(node.type(props)))
  }
  return { type: node.type, props: node.props, children: expand(node.children) }
}

function flatten(tree, sink = { text: [], nodes: [], className: [] }) {
  if (tree === null || tree === undefined) return sink
  if (typeof tree === 'string') { sink.text.push(tree); return sink }
  if (Array.isArray(tree)) { for (const child of tree) flatten(child, sink); return sink }
  if (typeof tree.props.className === 'string') sink.className.push(tree.props.className)
  sink.nodes.push(tree)
  flatten(tree.children, sink)
  return sink
}

const nodeText = (node) => (Array.isArray(node?.children) ? node.children.filter((child) => typeof child === 'string').join('') : '')
const byClass = (view, name) => view.nodes.filter((node) => typeof node.props.className === 'string' && node.props.className.split(/\s+/).includes(name))
const byText = (view, name) => view.nodes.find((node) => nodeText(node) === name)

function mount(component, props) {
  slots = new Map()
  let tree = null
  const render = () => {
    tree = expand(React.createElement(component, props))
    return tree
  }
  rerender = () => { render() }
  render()
  return {
    view: () => flatten(tree),
    click(name, matcher) {
      const view = flatten(tree)
      const node = matcher ? view.nodes.find(matcher) : byText(view, name) || byClass(view, name)[0]
      if (!node || typeof node.props.onClick !== 'function') throw new Error(`no clickable node for ${name}`)
      node.props.onClick({ stopPropagation() {}, preventDefault() {}, currentTarget: { value: '' }, key: 'Enter' })
      return flatten(tree)
    },
    contextMenu(name, matcher) {
      const view = flatten(tree)
      const node = matcher ? view.nodes.find(matcher) : byClass(view, name)[0]
      if (!node || typeof node.props.onContextMenu !== 'function') throw new Error(`no contextmenu node for ${name}`)
      node.props.onContextMenu({ preventDefault() {}, clientX: 320, clientY: 240 })
      return flatten(tree)
    },
    change(node, value) {
      if (!node || typeof node.props.onChange !== 'function') throw new Error('no change handler')
      node.props.onChange({ currentTarget: { value }, target: { value } })
      return flatten(tree)
    },
    input(predicate) {
      return flatten(tree).nodes.find(predicate)
    },
  }
}

// ---------------------------------------------------------------- environment
const store = new Map()
const localStorage = {
  getItem(key) { return store.has(key) ? store.get(key) : null },
  setItem(key, value) { store.set(key, String(value)) },
  removeItem(key) { store.delete(key) },
}

const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)
const pad = (value) => String(value).padStart(2, '0')
const TOMORROW = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`
store.set('control-room:meta', JSON.stringify({ 'ws-3': { stage: 'active', ddl: TOMORROW } }))

let factory = null
const copied = []
const renameCalls = []
const sandbox = {
  window: {
    __ModuleLoader__: { load(entry) { factory = entry.factory } },
    setInterval: () => 1,
    clearInterval: () => {},
    setTimeout: () => 1,
    clearTimeout: () => {},
    innerWidth: 1440,
    innerHeight: 900,
    localStorage,
  },
  navigator: { clipboard: { writeText: (text) => { copied.push(text) } } },
  fetch: async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      ok: true,
      scale: 'month',
      days: 30,
      usage: {
        tokens: { net: 5615952, total: 425073872 },
        records: 1262,
        sessions: 5,
        perHour: [
          { hour: 13, net: 400, total: 9000 },
          { hour: 14, net: 900, total: 12000 },
          { hour: 15, net: 700, total: 11000 },
          { hour: 20, net: 100, total: 8000 },
        ],
        perDay: [
          { day: '2026-11-20', net: 120, total: 900 },
          { day: '2026-11-22', net: 900, total: 4200 },
        ],
        perWeek: [
          { start: '2026-11-16', end: '2026-11-22', net: 5000, total: 30000 },
          { start: '2026-11-23', end: '2026-11-29', net: 9000, total: 90000 },
        ],
        perWorkspace: [],
      },
      balance: { status: 'ready', value: [{ currency: 'CNY', balance: '42.00' }], bonusWallets: [] },
    }),
  }),
  require(id) {
    if (id === 'react') return React
    throw new Error(`unexpected require: ${id}`)
  },
  console,
  Date,
}
vm.runInNewContext(source, sandbox, { filename: 'client.js' })

const plugin = factory(sandbox.require)
const registrations = []
const openedWorkspaces = []
const openedSessions = []
const ctx = {
  effect(fn) { fn() },
  locale: { register() {}, bind() { return (key) => key } },
  slots: {
    inject(_name, callback) { callback() },
    register(options, component) { registrations.push({ options, component }); return () => {} },
  },
  uiWorkspace: {
    openWorkspace: (id) => { openedWorkspaces.push(id); return Promise.resolve() },
    openSession: (id) => { openedSessions.push(id); return Promise.resolve() },
  },
  layout: { selectPanel() {} },
}
plugin.apply(ctx)

let failures = 0
const check = (label, condition, detail) => {
  if (condition) {
    console.log('PASS', label)
  } else {
    failures += 1
    console.log('FAIL', label, detail === undefined ? '' : String(detail))
  }
}

// ---------------------------------------------------------------- fixtures
const PATH_TEXT = 'C:\\Users\\demo\\projects\\alpha'
const projects = [
  { workspaceId: 'ws-1', title: 'alpha', path: PATH_TEXT, sessionIds: ['s1', 's2'], createdAt: '2026-10-01T02:00:00.000Z', updatedAt: new Date().toISOString() },
  { workspaceId: 'ws-2', title: 'beta', path: 'D:\\work\\beta', sessionIds: ['s3'], createdAt: '2026-09-01T02:00:00.000Z', updatedAt: '2026-11-01T02:00:00.000Z' },
  { workspaceId: 'ws-3', title: 'gamma', path: 'D:\\work\\gamma', sessionIds: ['s4'], createdAt: '2026-08-01T02:00:00.000Z', updatedAt: '2026-10-15T02:00:00.000Z' },
  { workspaceId: 'ws-4', title: 'delta', path: 'D:\\work\\delta', sessionIds: ['s5'], createdAt: '2026-07-01T02:00:00.000Z', updatedAt: '2026-09-01T02:00:00.000Z' },
]
const sessions = {
  ids: ['s1', 's2', 's3', 's4', 's5'],
  byId: {
    s1: { id: 's1', title: 'run the backtest', updatedAt: new Date().toISOString(), running: true },
    s2: { id: 's2', title: 'clean the data', updatedAt: '2026-11-02T02:00:00.000Z', running: false },
    s3: { id: 's3', title: 'write the case report', updatedAt: '2026-11-01T02:00:00.000Z', running: false },
    s4: { id: 's4', title: 'read statements', updatedAt: '2026-10-15T02:00:00.000Z', running: false },
    s5: { id: 's5', title: 'set up env', updatedAt: '2026-09-01T02:00:00.000Z', running: false },
  },
}
const statuses = new Map([
  ['s1', { running: true }],
  ['s3', { running: false, pendingInteraction: { kind: 'approval' } }],
])

const main = registrations.find((entry) => entry.options.name === 'main')
const foot = registrations.find((entry) => entry.options.name === 'sidebar.footer.action')

check('two slot registrations', registrations.length === 2, registrations.length)
check('main panel key', main?.options.key === 'control-room')
check('footer action id', foot?.options.id === 'control-room')

function baseProps() {
  const injected = main.options.inject()
  return {
    t: (key) => key,
    useWorkspaces: (selector) => selector({ items: projects }),
    useSessions: (selector) => selector(sessions),
    useSessionStatus: (selector) => selector(statuses),
    ...injected,
    readUsage: () => ({ ok: true, balance: { status: 'ready', value: [{ currency: 'CNY', balance: '42.00' }] } }),
    renameWorkspace: (workspaceId, title) => {
      renameCalls.push({ workspaceId, title })
      return Promise.resolve({ ok: true })
    },
  }
}

if (main) {
  const page = mount(main.component, baseProps())
  const grid = page.view()

  check('every project rendered', byClass(grid, 'cr-card').length === 4, byClass(grid, 'cr-card').length)
  const states = byClass(grid, 'cr-card').map((node) => node.props['data-state'])
  check('three distinct states rendered', ['waiting', 'running', 'idle'].every((state) => states.includes(state)), states.join(','))
  check('needs-you project first', byClass(grid, 'cr-card')[0].props.title.startsWith('beta'), byClass(grid, 'cr-card')[0].props.title)

  const gridNode = grid.nodes.find((node) => node.props.className === 'cr-grid')
  check('three columns for four cards', gridNode?.props.style?.['--cr-cols'] === '3', gridNode?.props.style?.['--cr-cols'])
  check('focus bar capped at three', byClass(grid, 'cr-focusItem').length > 0 && byClass(grid, 'cr-focusItem').length <= 3, byClass(grid, 'cr-focusItem').length)
  check('focus explains why', grid.text.includes('waitApproval') && grid.text.includes('dueTomorrow'))
  check('first-run hint renders', grid.className.includes('cr-hint'))
  check('no path leaked', !grid.text.join('|').includes(PATH_TEXT))
  check('no templates left in the bundle', !source.includes('tplStatements') && !source.includes('startTemplate'))

  // --- stage colours (static) vs activity (pulsing)
  const stagedCard = grid.nodes.find((node) => node.props.className === 'cr-card' && String(node.props.title).startsWith('gamma'))
  check('staged card carries its colour', stagedCard?.props['data-stage'] === 'active' && stagedCard?.props?.style?.['--cr-stage'] === '#ff8a00', JSON.stringify(stagedCard?.props?.style))
  const unstagedCard = grid.nodes.find((node) => node.props.className === 'cr-card' && String(node.props.title).startsWith('beta'))
  check('unstaged card is neutral', unstagedCard?.props['data-stage'] === 'none' && !unstagedCard?.props?.style)
  check('every card shows a stage tag', byClass(grid, 'cr-stageTag').length === 4, byClass(grid, 'cr-stageTag').length)
  check('stage colours never use the activity lime', !/STAGE_META\s*=\s*\{[^}]*c8ff00/.test(source))

  // --- card opens the project cockpit, not the conversation
  const beforeOpen = openedWorkspaces.length
  const cardView = page.click('cr-card', (node) => node.props.className === 'cr-card' && String(node.props.title).startsWith('beta'))
  check('card opens the detail view', byClass(cardView, 'cr-detail').length === 1)
  check('detail shows the project name', byClass(cardView, 'cr-detailName')[0]?.children?.join('') === 'beta', byClass(cardView, 'cr-detailName')[0]?.children)
  check('card click did not start a conversation', openedWorkspaces.length === beforeOpen)
  check('grid is replaced by detail', byClass(cardView, 'cr-grid').length === 0)
  check('four tabs offered', byClass(cardView, 'cr-tab').length === 4, byClass(cardView, 'cr-tab').length)

  // --- tasks tab
  const tasksView = page.click('tabTasks')
  check('tasks tab opens', byClass(tasksView, 'cr-taskForm').length === 1)
  check('tasks empty state', tasksView.text.includes('tasksEmpty'))

  const taskInput = page.input((node) => node.type === 'input' && node.props.placeholder === 'taskPlaceholder')
  page.change(taskInput, 'write chapter one')
  const afterAdd = page.click('taskAdd')
  const rows = byClass(afterAdd, 'cr-taskRow')
  check('task can be added', rows.length === 1 && afterAdd.text.includes('write chapter one'), rows.length)

  const stored = JSON.parse(store.get('control-room:meta'))
  check('task persisted to localStorage', Array.isArray(stored['ws-2']?.tasks) && stored['ws-2'].tasks[0].text === 'write chapter one', JSON.stringify(stored['ws-2']))

  const afterToggle = page.click('cr-taskCheck')
  check('task can be completed', byClass(afterToggle, 'cr-taskRow')[0].props['data-done'] === 'true')

  // --- board tab
  const boardView = page.click('tabBoard')
  check('board shows stats', byClass(boardView, 'cr-stat').length === 4, byClass(boardView, 'cr-stat').length)
  check('board shows 14-day activity', byClass(boardView, 'cr-bar').length === 14, byClass(boardView, 'cr-bar').length)

  // --- sessions tab
  const sessionsView = page.click('tabSessions')
  const sessionRows = byClass(sessionsView, 'cr-sessionRow')
  check('sessions are listed', sessionRows.length === 1 && sessionsView.text.includes('write the case report'), sessionRows.length)
  page.click('cr-sessionOpen')
  check('session row opens that session', openedSessions.includes('s3'), openedSessions.join(','))

  // --- session star + note
  const starred = page.click('cr-star')
  check('session can be starred', byClass(starred, 'cr-star')[0].props['aria-pressed'] === 'true')
  const afterStar = JSON.parse(store.get('control-room:meta'))
  check('star persisted', afterStar['ws-2']?.sessionNotes?.s3?.star === true, JSON.stringify(afterStar['ws-2']))

  page.click('cr-noteBtn')
  const noteInput = page.input((node) => node.type === 'input' && node.props.placeholder === 'notePlaceholder')
  page.change(noteInput, 'conclusion lives here')
  const afterNote = JSON.parse(store.get('control-room:meta'))
  check('note persisted', afterNote['ws-2']?.sessionNotes?.s3?.note === 'conclusion lives here', JSON.stringify(afterNote['ws-2']))

  // --- back to the grid
  const backView = page.click('cr-back')
  check('back returns to the grid', byClass(backView, 'cr-card').length === 4)
  check('hint still dismissible', byClass(backView, 'cr-btn').length > 0)

  // --- clock
  check('clock renders', byClass(backView, 'cr-clock').length === 1)
  check('clock shows hh:mm', /^\d{2}:\d{2}$/.test(String(byClass(backView, 'cr-clockTime')[0]?.children?.[0] || '')), byClass(backView, 'cr-clockTime')[0]?.children)
  check('clock shows a full date', /^\d{4}\.\d{2}\.\d{2}$/.test(String(byClass(backView, 'cr-clockDate')[0]?.children?.[0] || '')), byClass(backView, 'cr-clockDate')[0]?.children)
  check('clock shows a weekday', String(byClass(backView, 'cr-clockWeek')[0]?.children?.[0] || '').length > 0, byClass(backView, 'cr-clockWeek')[0]?.children)

  // --- layout contract: focus shares the clock row, records stay inside the panel
  const topNode = backView.nodes.find((node) => node.props.className === 'cr-top')
  const topKids = (topNode?.children || []).map((child) => child?.props?.className).filter(Boolean)
  check('focus sits on the clock row', topKids.includes('cr-focus') && topKids.includes('cr-clock'), topKids.join(','))
  const rootNode = backView.nodes.find((node) => node.props.className === 'cr-root')
  const rootKids = (rootNode?.children || []).map((child) => child?.props?.className).filter(Boolean)
  check('records button lives inside the panel shell', rootKids.includes('cr-scroll') && rootKids.includes('cr-recordsBtn'), rootKids.join(','))

  // --- records panel and export
  const recordsView = page.click('cr-recordsBtn')
  check('records panel opens', byClass(recordsView, 'cr-records').length === 1)
  check('records offers three scales', byClass(recordsView, 'cr-scaleBtn').length === 3, byClass(recordsView, 'cr-scaleBtn').length)
  check('records shows three metrics before usage arrives', byClass(recordsView, 'cr-recordsStat').length === 3, byClass(recordsView, 'cr-recordsStat').length)
  check('peak tile is absent without host usage', !recordsView.text.join('|').includes('metricPeak'))
  const weekView = page.click('scaleWeek')
  check('scale switches to week', byClass(weekView, 'cr-scaleBtn')[1].props['aria-pressed'] === 'true')
  check('export downloads are offered', byText(weekView, 'exportDownload') !== undefined)
  page.click('exportCopy')
  check('export copies markdown', copied.length > 0 && copied[copied.length - 1].startsWith('#'), copied.length)

  // --- token tile → account dialog
  const tokenView = page.click('cr-recordsStat--action')
  check('token tile opens the account dialog', byClass(tokenView, 'cr-dialog').length === 1)
  check('dialog explains the missing metering', tokenView.text.includes('tokenUnknownBody'))
  const readView = page.click('tokenRead')
  check('reading the account reports a balance', readView.text.join('|').includes('CNY 42.00'), readView.text.join('|'))
  check('token dialog no longer offers sign-in', byText(readView, 'tokenConnect') === undefined)

  // --- Host route: real token counts + account balance arrive together
  await new Promise((resolve) => setTimeout(resolve, 0))
  const hostView = page.view()
  const hostText = hostView.text.join('|')
  check('host usage fills the token tile', hostText.includes('5.6M'), hostText.slice(0, 400))
  check('dialog shows net and total tokens', hostText.includes('tokenNet: 5.6M') && hostText.includes('tokenTotal: 425.1M'), hostText.slice(0, 400))
  check('dialog reports metered records', hostText.includes('tokenRecords: 1262'))

  // --- peak window follows the scale, ranked by tokens
  check('peak tile appears with host usage', byClass(hostView, 'cr-recordsStat').length === 4, byClass(hostView, 'cr-recordsStat').length)
  check('week scale ranks the busiest day', hostText.includes('11-22') && hostText.includes('peakHintDay'), hostText.slice(0, 600))

  const dayPeakView = page.click('scaleDay')
  const dayPeakText = dayPeakView.text.join('|')
  check('day scale ranks the busiest three hours', dayPeakText.includes('13:00—16:00') && dayPeakText.includes('peakHintHours'), dayPeakText.slice(0, 600))

  const monthPeakView = page.click('scaleMonth')
  const monthPeakText = monthPeakView.text.join('|')
  check('month scale ranks the busiest week', monthPeakText.includes('11-23—11-29') && monthPeakText.includes('peakHintWeek'), monthPeakText.slice(0, 600))

  // --- right-click menu: rename / archive / hide / session notes
  page.click('close')
  check('token dialog closes', byClass(page.view(), 'cr-dialog').length === 0)

  const menuView = page.contextMenu('cr-card', (node) => node.props.className === 'cr-card' && String(node.props.title).startsWith('beta'))
  check('context menu opens', byClass(menuView, 'cr-menuItem').length === 4, byClass(menuView, 'cr-menuItem').length)

  // --- rename: modal, host call, immediate card update
  page.click('menuRename')
  const renameView = page.view()
  check('rename dialog opens', byClass(renameView, 'cr-dialog').length === 1)
  const renameInput = page.input((node) => node.props.className === 'cr-input')
  check('rename input is prefilled', renameInput !== undefined && renameInput.props.value === 'beta', renameInput && renameInput.props.value)
  page.change(renameInput, '新名字')
  page.click('cancel')
  check('cancel closes without renaming', byClass(page.view(), 'cr-dialog').length === 0 && renameCalls.length === 0)

  page.contextMenu('cr-card', (node) => node.props.className === 'cr-card' && String(node.props.title).startsWith('beta'))
  page.click('menuRename')
  page.change(page.input((node) => node.props.className === 'cr-input'), '新名字')
  page.click('confirm')
  await new Promise((resolve) => setTimeout(resolve, 0))
  const renamedView = page.view()
  check('rename calls the host', renameCalls.length === 1 && renameCalls[0].title === '新名字', JSON.stringify(renameCalls))
  check('card shows the new title', renamedView.text.join('|').includes('新名字'))
  check('rename dialog closes after success', byClass(renamedView, 'cr-dialog').length === 0)

  page.contextMenu('cr-card', (node) => node.props.className === 'cr-card' && String(node.props.title).includes('新名字'))
  const afterArchive = page.click('menuArchive')
  check('archiving removes the card', byClass(afterArchive, 'cr-card').length === 3, byClass(afterArchive, 'cr-card').length)
  check('hidden toggle appears', byClass(afterArchive, 'cr-hiddenToggle').length === 1)
  const shown = page.click('cr-hiddenToggle')
  check('archived cards can be shown again', byClass(shown, 'cr-card').length === 4, byClass(shown, 'cr-card').length)
  check('archived card is flagged', byClass(shown, 'cr-flag').length >= 1, byClass(shown, 'cr-flag').length)

  // --- "open chat" from the header
  page.click('cr-card', (node) => node.props.className === 'cr-card')
  const openBefore = openedWorkspaces.length
  page.click('cr-btn--primary')
  check('open chat reaches the host', openedWorkspaces.length === openBefore + 1, openedWorkspaces.join(','))

  // --- metadata still renders on cards after going back
  const backAgain = page.click('cr-back')
  const metaCard = backAgain.nodes.find((node) => node.props.className === 'cr-card' && String(node.props.title).startsWith('gamma'))
  check('stored stage and deadline render on cards', Boolean(metaCard?.children?.some((child) => child?.props?.className === 'cr-meta')), metaCard?.props?.title)
}

// ---------------------------------------------------------------- css contract
if (main) {
  const css = source.slice(source.indexOf('const CSS ='), source.indexOf('function Styles'))
  check('stylesheet present', css.length > 4000)
  check('memphis palette tokens', ['--cr-lime', '--cr-magenta', '--cr-cyan', '--cr-amber'].every((token) => css.includes(token)))
  check('fluorescent lime defined', css.includes('#c8ff00'))
  check('hard 2px outline', css.includes('border:2px solid var(--cr-line)'))
  check('hard offset shadow, zero blur', css.includes('box-shadow:9px 9px 0'))
  check('no glass on cards', !css.includes('backdrop-filter') && !css.includes('mask-composite'))
  check('square cards', css.includes('aspect-ratio:1/1') && css.includes('border-radius:4px'))
  check('cards are axis-aligned', !css.includes('rotate('))
  check('wrapping three-column grid', css.includes('grid-template-columns:repeat(var(--cr-cols'))
  check('solid page background', css.includes('--dsw-alias-bg-base'))
  check('running displacement pulse', css.includes('@keyframes cr-pulse'))
  check('reduced motion honoured', css.includes('prefers-reduced-motion'))
  check('records pinned inside the panel', /\.cr-recordsBtn\{position:absolute/.test(css) && /\.cr-records\{position:absolute/.test(css))
  check('account dialog is a real modal layer', /\.cr-scrim\{[^}]*position:fixed/.test(css) && /\.cr-scrim\{[^}]*z-index:1000/.test(css))
  check('modal carries its own theme tokens', /\.cr-scrim\{[^}]*--cr-line:/.test(css))
  check('panel itself does not scroll', /\.cr-root\{[^}]*overflow:hidden/.test(css) && /\.cr-scroll\{[^}]*overflow:auto/.test(css))
  check('css braces balanced', (css.match(/\{/g) || []).length === (css.match(/\}/g) || []).length)

  // --- Host half contract (cannot be driven from this test, so assert the wiring)
  const host = fs.readFileSync(path.join(root, 'control-room', 'index.js'), 'utf8')
  const usage = fs.readFileSync(path.join(root, 'control-room', 'usage.js'), 'utf8')
  check('host half registers the usage route', host.includes('/api/control-room-usage') && host.includes('connection.fetch.register'))
  check('host route is owner-fenced by the framework', host.includes('inject = [\'connection\']'))
  check('usage scanner walks concatenated zstd frames', usage.includes('zstdDecompressSync') && usage.includes('bytesWritten'))
  check('usage scanner reports both token figures', usage.includes('net:') && usage.includes('total:'))
  check('host returns the account balance too', host.includes('readBalance'))
}

if (foot) {
  const injected = foot.options.inject()
  const wide = flatten(expand(React.createElement(foot.component, { wide: true, ...injected })))
  check('footer shows label when wide', wide.className.includes('cr-sideLabel'))
  const rail = flatten(expand(React.createElement(foot.component, { wide: false, ...injected })))
  check('footer hides label in rail', !rail.className.includes('cr-sideLabel'))
  check('footer keeps accessible name', rail.nodes.some((node) => typeof node.props['aria-label'] === 'string'))
}

console.log(failures === 0 ? 'ALL_OK' : `FAILED ${failures}`)
process.exit(failures === 0 ? 0 : 1)
