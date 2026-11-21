#!/usr/bin/env node
/**
 * Offline structural check for the Control room bundle.
 * Loads client.js with a minimal React stand-in, applies the plugin to a fake
 * slot registry, and asserts the registrations and rendered tree.
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
  navigator: { clipboard: { writeText: () => Promise.resolve() } },
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

function walk(node, sink) {
  if (node === null || node === undefined || typeof node === 'boolean') return
  if (typeof node === 'string' || typeof node === 'number') { sink.push(String(node)); return }
  if (Array.isArray(node)) { for (const child of node) walk(child, sink); return }
  if (typeof node.type === 'function') {
    const props = { ...node.props }
    if (node.children.length > 0) props.children = node.children
    walk(node.type(props), sink)
    return
  }
  if (node.type === undefined) { walk(node.children, sink); return }
  if (typeof node.props.className === 'string') sink.push(node.props.className)
  if (node.props['data-running'] === 'true') sink.push('RUNNING_CARD')
  walk(node.children, sink)
}

const main = registrations.find((entry) => entry.options.name === 'main')
const foot = registrations.find((entry) => entry.options.name === 'sidebar.footer.action')

check('two slot registrations', registrations.length === 2, registrations.length)
check('main panel key', main?.options.key === 'control-room')
check('footer action id', foot?.options.id === 'control-room')

const PATH_TEXT = 'C:\\Users\\demo\\projects\\alpha'
const projects = [
  { workspaceId: 'ws-1', title: 'alpha', path: PATH_TEXT, sessionIds: ['s1', 's2'], createdAt: '2026-10-01T02:00:00.000Z', updatedAt: new Date().toISOString() },
  { workspaceId: 'ws-2', title: 'beta', path: 'D:\\work\\beta', sessionIds: ['s3'], createdAt: '2026-09-01T02:00:00.000Z', updatedAt: '2026-11-01T02:00:00.000Z' },
]
const sessions = { ids: ['s1', 's2', 's3'], byId: { s1: { running: true }, s2: { running: false }, s3: { running: false } } }

if (main) {
  const injected = main.options.inject()
  const props = {
    t: (key) => key,
    useWorkspaces: (selector) => selector({ items: projects }),
    useSessions: (selector) => selector(sessions),
    ...injected,
  }
  const text = []
  walk(main.component(props), text)
  const joined = text.join('|')

  check('cards render', text.filter((item) => item === 'cr-card').length === 2)
  check('one path occurrence (detail only)', joined.split(PATH_TEXT).length - 1 === 1)
  check('one action per card', text.filter((item) => item === 'cr-mini').length === 2)
  check('single running card', text.filter((item) => item === 'RUNNING_CARD').length === 1)
  check('running chip and elapsed', joined.includes('running') && joined.includes('00:00'))
  check('live pill', joined.includes('livePrefix'))
  check('no duplicate new-session action', !('startSession' in injected))

  const css = text.find((item) => item.includes('.cr-root'))
  check('stylesheet present', typeof css === 'string' && css.length > 2000)
  check('liquid-glass tokens', typeof css === 'string' && css.includes('--cr-glass-top') && css.includes('backdrop-filter'))
  check('specular rim mask', typeof css === 'string' && css.includes('mask-composite'))
  check('running animation', typeof css === 'string' && css.includes('@keyframes cr-breathe'))
  check('reduced motion honoured', typeof css === 'string' && css.includes('prefers-reduced-motion'))
  check('css braces balanced', (css.match(/\{/g) || []).length === (css.match(/\}/g) || []).length)
}

if (foot) {
  const injected = foot.options.inject()
  const wide = []
  walk(foot.component({ wide: true, ...injected }), wide)
  check('footer shows label when wide', wide.includes('cr-sideLabel'))
  const rail = JSON.stringify(foot.component({ wide: false, ...injected }), (key, value) => (typeof value === 'function' ? undefined : value))
  check('footer hides label in rail', !rail.includes('cr-sideLabel'))
  check('footer keeps accessible name', rail.includes('aria-label'))
}

console.log(failures === 0 ? 'ALL_OK' : `FAILED ${failures}`)
process.exit(failures === 0 ? 0 : 1)
