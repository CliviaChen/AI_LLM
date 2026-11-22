#!/usr/bin/env node
/**
 * Offline structural check for the Control room bundle.
 * Loads client.js with a minimal React stand-in, applies the plugin to a fake
 * slot registry, and asserts the registrations and the rendered tree.
 * No dependencies; run with `node scripts/verify.mjs`.
 */
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const source = fs.readFileSync(path.join(root, 'control-room', 'client.js'), 'utf8')

const FRAGMENT = Symbol('Fragment')
const React = {
  Fragment: FRAGMENT,
  createElement(type, props, ...children) {
    return { type, props: props || {}, children: children.flat(Infinity) }
  },
  useState(initial) {
    return [typeof initial === 'function' ? initial() : initial, () => {}]
  },
  useMemo(factory) {
    return factory()
  },
  useRef(initial) {
    return { current: initial }
  },
  useEffect() {},
}

let factory = null
const sandbox = {
  window: {
    __ModuleLoader__: { load(entry) { factory = entry.factory } },
    setInterval: () => 1,
    clearInterval: () => {},
    setTimeout: () => 1,
  },
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
const ctx = {
  effect(fn) { fn() },
  locale: { register() {}, bind() { return (key) => key } },
  slots: {
    inject(_name, callback) { callback() },
    register(options, component) { registrations.push({ options, component }); return () => {} },
  },
  uiWorkspace: { openWorkspace: () => Promise.resolve() },
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

/** Flatten a rendered tree into text fragments, host element nodes and class names. */
function walk(node, sink) {
  if (node === null || node === undefined || typeof node === 'boolean') return
  if (typeof node === 'string' || typeof node === 'number') { sink.text.push(String(node)); return }
  if (Array.isArray(node)) { for (const child of node) walk(child, sink); return }
  if (typeof node.type === 'function') {
    const props = { ...node.props }
    if (node.children.length > 0) props.children = node.children
    walk(node.type(props), sink)
    return
  }
  if (node.type === undefined) { walk(node.children, sink); return }
  if (typeof node.props.className === 'string') sink.className.push(node.props.className)
  if (node.props['data-running'] === 'true') sink.running.push('RUNNING_CARD')
  if (typeof node.props.title === 'string') sink.title.push(node.props.title)
  sink.nodes.push(node)
  walk(node.children, sink)
}

const sink = () => ({ text: [], className: [], running: [], title: [], nodes: [] })

const main = registrations.find((entry) => entry.options.name === 'main')
const foot = registrations.find((entry) => entry.options.name === 'sidebar.footer.action')

check('two slot registrations', registrations.length === 2, registrations.length)
check('main panel key', main?.options.key === 'control-room')
check('footer action id', foot?.options.id === 'control-room')

const PATH_TEXT = 'C:\\Users\\demo\\projects\\alpha'
const projects = [
  { workspaceId: 'ws-1', title: 'alpha', path: PATH_TEXT, sessionIds: ['s1', 's2'], createdAt: '2026-10-01T02:00:00.000Z', updatedAt: new Date().toISOString() },
  { workspaceId: 'ws-2', title: 'beta', path: 'D:\\work\\beta', sessionIds: ['s3'], createdAt: '2026-09-01T02:00:00.000Z', updatedAt: '2026-11-01T02:00:00.000Z' },
  { workspaceId: 'ws-3', title: 'gamma', path: 'D:\\work\\gamma', sessionIds: ['s4'], createdAt: '2026-08-01T02:00:00.000Z', updatedAt: '2026-10-15T02:00:00.000Z' },
  { workspaceId: 'ws-4', title: 'delta', path: 'D:\\work\\delta', sessionIds: ['s5'], createdAt: '2026-07-01T02:00:00.000Z', updatedAt: '2026-09-01T02:00:00.000Z' },
]
const sessions = {
  ids: ['s1', 's2', 's3', 's4', 's5'],
  byId: { s1: { running: true }, s2: { running: false }, s3: { running: false }, s4: { running: false }, s5: { running: false } },
}

let opened = []

function renderPage(items) {
  const injected = main.options.inject()
  const props = {
    t: (key) => key,
    useWorkspaces: (selector) => selector({ items }),
    useSessions: (selector) => selector(sessions),
    ...injected,
    openProject: (workspaceId) => { opened.push(workspaceId) },
  }
  const out = sink()
  walk(main.component(props), out)
  return { out, injected }
}

if (main) {
  opened = []
  const { out, injected } = renderPage(projects)
  const joined = out.text.join('|')
  const cards = out.className.filter((item) => item === 'cr-card').length
  const grid = out.nodes.find((node) => node.props.className === 'cr-grid')

  check('every project rendered', cards === 4, cards)
  check('three columns for four cards', grid?.props.style?.['--cr-cols'] === '3', grid?.props.style?.['--cr-cols'])
  const cardTitles = out.title.map((item) => String(item).split(' — ')[0])
  check('running project ranked first', cardTitles[0] === 'alpha', cardTitles[0])
  check('card titles in recency order', cardTitles.join(',') === 'alpha,beta,gamma,delta', cardTitles.join(','))
  check('vector mark per card', out.className.filter((item) => item === 'cr-mark').length === 4)
  check('page has accessible name', out.className.filter((item) => item === 'cr-srOnly').length >= 1)
  check('no letter monogram left', !out.text.includes('A'), out.text.join(','))
  check('single running card', out.running.length === 1)
  check('running chip and elapsed', joined.includes('running') && joined.includes('00:00'))
  check('no path printed on cards', !joined.includes(PATH_TEXT))

  // Column count follows the number of cards, never exceeding three.
  const two = renderPage(projects.slice(0, 2)).out
  const twoGrid = two.nodes.find((node) => node.props.className === 'cr-grid')
  check('two cards give two columns', twoGrid?.props.style?.['--cr-cols'] === '2', twoGrid?.props.style?.['--cr-cols'])

  const many = [5, 6, 7].reduce((list, index) => list.concat([{
    workspaceId: 'ws-' + index,
    title: 'extra-' + index,
    path: 'D:\\work\\extra-' + index,
    sessionIds: ['sx' + index],
    createdAt: '2026-06-01T02:00:00.000Z',
    updatedAt: '2026-09-0' + (index - 4) + 'T02:00:00.000Z',
  }]), projects.slice())
  const manyOut = renderPage(many).out
  const manyGrid = manyOut.nodes.find((node) => node.props.className === 'cr-grid')
  const manyCards = manyOut.className.filter((item) => item === 'cr-card').length
  check('seven projects all rendered', manyCards === 7, manyCards)
  check('seven cards still cap at three columns', manyGrid?.props.style?.['--cr-cols'] === '3', manyGrid?.props.style?.['--cr-cols'])

  const classTokens = new Set(out.className.flatMap((item) => item.split(/\s+/)))

  // The page is cards only: none of the former chrome, stats, detail or overview panels remain.
  for (const gone of ['cr-head', 'cr-panel', 'cr-stat', 'cr-hero', 'cr-info', 'cr-search', 'cr-tip']) {
    check(`removed ${gone}`, !classTokens.has(gone))
  }

  const firstCard = out.nodes.find((node) => node.type === 'button' && node.props.className === 'cr-card')
  opened = []
  firstCard?.props.onClick()
  check('card opens its project', opened.length === 1 && opened[0] === 'ws-1', opened.join(','))
  check('card names its action', String(firstCard?.props['aria-label']).includes('enter'), firstCard?.props['aria-label'])

  check('no extra inject surface', !('startSession' in injected) && !('backToChat' in injected))

  const css = out.text.find((item) => item.includes('.cr-root'))
  check('stylesheet present', typeof css === 'string' && css.length > 1500)
  check('glass tokens', typeof css === 'string' && css.includes('--cr-glass-top') && css.includes('backdrop-filter'))
  check('specular rim mask', typeof css === 'string' && css.includes('mask-composite'))
  check('rounded square card', typeof css === 'string' && css.includes('aspect-ratio:1/1') && css.includes('border-radius:clamp'))
  check('wrapping three-column grid', typeof css === 'string' && css.includes('grid-template-columns:repeat(var(--cr-cols'))
  const gridRule = (String(css).match(/\.cr-grid\{[^}]*\}/) || [''])[0]
  check('grid starts its rows at the left', gridRule.includes('margin:auto') && !gridRule.includes('justify-content'), gridRule)
  check('larger card gap', typeof css === 'string' && css.includes('--cr-gap'))
  check('solid page background', typeof css === 'string' && css.includes('--dsw-alias-bg-base'))
  check('flowing running rim', typeof css === 'string' && css.includes('@keyframes cr-flow') && css.includes('conic-gradient'))
  check('running breathe kept', typeof css === 'string' && css.includes('@keyframes cr-breathe'))
  check('reduced motion honoured', typeof css === 'string' && css.includes('prefers-reduced-motion'))
  check('css braces balanced', (css.match(/\{/g) || []).length === (css.match(/\}/g) || []).length)
}

if (foot) {
  const injected = foot.options.inject()
  const wide = sink()
  walk(foot.component({ wide: true, ...injected }), wide)
  check('footer shows label when wide', wide.className.includes('cr-sideLabel'))
  const rail = sink()
  walk(foot.component({ wide: false, ...injected }), rail)
  check('footer hides label in rail', !rail.className.includes('cr-sideLabel'))
  check('footer keeps accessible name', rail.nodes.some((node) => typeof node.props['aria-label'] === 'string'))
}

console.log(failures === 0 ? 'ALL_OK' : `FAILED ${failures}`)
process.exit(failures === 0 ? 0 : 1)
