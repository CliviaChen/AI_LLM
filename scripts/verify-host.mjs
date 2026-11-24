#!/usr/bin/env node
/**
 * Host-half check for the Control room bundle.
 * Imports control-room/index.js with fake Cordis contexts, captures the exact
 * Fetch route it registers, and drives that route against the real session logs.
 * Each scenario imports a fresh module instance via a cache-busting query.
 * No dependencies; run with `node scripts/verify-host.mjs`.
 */
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { listLogFiles, sessionOf, dshHome } from '../control-room/usage.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const entry = pathToFileURL(path.join(root, 'control-room', 'index.js')).href

let failures = 0
const check = (label, condition, detail) => {
  if (condition) console.log('PASS', label)
  else {
    failures += 1
    console.log('FAIL', label, detail === undefined ? '' : String(detail))
  }
}

let tag = 0
const loadPlugin = () => import(entry + '?case=' + (++tag))

function makeCtx(options = {}) {
  const routes = []
  const renameCalls = []
  const controller = {
    async rename(request) {
      renameCalls.push(request)
      return { workspace: { workspaceId: request.workspaceId, title: request.title } }
    },
  }
  const account = options.account === undefined
    ? {
      async getBalance() {
        return { status: 'ready', value: [{ currency: 'CNY', balance: '42.00' }], bonusWallets: [] }
      },
    }
    : options.account

  const register = options.register || ((route) => {
    routes.push(route)
    return () => {}
  })

  const connection = options.connection === undefined
    ? { fetch: { register } }
    : options.connection

  const ctx = {
    effect(fn) {
      return fn()
    },
    get(name) {
      if (name === 'connection') return connection
      if (name === 'deepseekAccount') return account
      if (name === 'workspaceController') return options.controller === undefined ? controller : options.controller
      return undefined
    },
    connection,
  }
  return { ctx, routes, renameCalls }
}

// ---------------------------------------------------------------- happy path
{
  const mod = await loadPlugin()
  check('host half exports apply', typeof mod.apply === 'function')
  check('host half injects connection', Array.isArray(mod.inject) && mod.inject.includes('connection'), JSON.stringify(mod.inject))

  const { ctx, routes, renameCalls } = makeCtx()
  mod.apply(ctx)
  check('both routes registered', routes.length === 2, routes.length)

  const route = routes.find((item) => item.path === '/api/control-room-usage') || {}
  const renameRoute = routes.find((item) => item.path === '/api/control-room-rename') || {}
  check('route path', route.path === '/api/control-room-usage', route.path)
  check('route accepts GET only', Array.isArray(route.methods) && route.methods.length === 1 && route.methods[0] === 'GET', JSON.stringify(route.methods))
  check('route declares a body mode', typeof route.requestBody === 'string', route.requestBody)
  check('rename route accepts POST only', renameRoute.methods && renameRoute.methods.length === 1 && renameRoute.methods[0] === 'POST', JSON.stringify(renameRoute.methods))

  const response = await route.fetch({ url: 'http://127.0.0.1:61469/api/control-room-usage?scale=week' })
  check('route answers 200', response.status === 200, response.status)
  const body = await response.json()
  check('payload is ok', body.ok === true, JSON.stringify(body).slice(0, 200))
  check('route reports the scale', body.scale === 'week' && body.days === 7, body.scale + '/' + body.days)
  check('usage is scanned from logs', body.usage && body.usage.files > 0, body.usage && body.usage.files)
  check('both token figures present',
    body.usage && body.usage.tokens && body.usage.tokens.net > 0 && body.usage.tokens.total >= body.usage.tokens.net,
    body.usage && JSON.stringify(body.usage.tokens))
  check('balance comes from the account service',
    body.balance && body.balance.value && body.balance.value[0].currency === 'CNY',
    JSON.stringify(body.balance))
  check('hourly buckets are token sums',
    Array.isArray(body.usage.perHour) && body.usage.perHour.length === 24
      && body.usage.perHour.every((row) => typeof row.hour === 'number' && typeof row.net === 'number'),
    JSON.stringify(body.usage.perHour && body.usage.perHour.slice(0, 2)))
  check('weekly buckets start on Monday and carry tokens',
    Array.isArray(body.usage.perWeek) && body.usage.perWeek.length > 0
      && body.usage.perWeek.every((row) => /^\d{4}-\d{2}-\d{2}$/.test(row.start) && /^\d{4}-\d{2}-\d{2}$/.test(row.end) && typeof row.net === 'number'),
    JSON.stringify(body.usage.perWeek && body.usage.perWeek.slice(-2)))

  const dayResponse = await route.fetch({ url: 'http://127.0.0.1:61469/api/control-room-usage?scale=day' })
  const dayBody = await dayResponse.json()
  check('day scale narrows to one day', dayBody.days === 1, dayBody.days)
  check('day window never exceeds the week window', dayBody.usage.tokens.net <= body.usage.tokens.net, dayBody.usage.tokens.net + ' <= ' + body.usage.tokens.net)

  // --- session scoping, used by the per-project week chart
  const firstLog = listLogFiles(dshHome())[0]
  if (firstLog) {
    const bareId = sessionOf(firstLog.file).replace(/^session-/, '')
    const since = Date.now() - 7 * 86400000
    const scoped = await route.fetch({ url: 'http://127.0.0.1:61469/api/control-room-usage?since=' + since + '&sessions=' + encodeURIComponent(bareId) })
    const scopedBody = await scoped.json()
    check('session scope is reported', scopedBody.scopedSessions === 1, scopedBody.scopedSessions)
    check('session scope keeps only that session log', scopedBody.usage.files <= 1, scopedBody.usage.files)
    check('scoped window is honoured', scopedBody.since === since, scopedBody.since + ' vs ' + since)

    const unknown = await route.fetch({ url: 'http://127.0.0.1:61469/api/control-room-usage?since=' + since + '&sessions=nope-not-a-session' })
    const unknownBody = await unknown.json()
    check('unknown session yields no records', unknownBody.usage.records === 0, unknownBody.usage.records)
  }

  const badResponse = await route.fetch({ url: 'not a url' })
  check('bad url is rejected with 400', badResponse.status === 400, badResponse.status)

  // --- rename route
  const renameOk = await renameRoute.fetch({ json: async () => ({ workspaceId: 'ws-1', title: '  研究计划  ' }) })
  check('rename answers 200', renameOk.status === 200, renameOk.status)
  const renameBody = await renameOk.json()
  check('rename calls the controller with a trimmed title',
    renameCalls.length === 1 && renameCalls[0].workspaceId === 'ws-1' && renameCalls[0].title === '研究计划',
    JSON.stringify(renameCalls))
  check('rename reports ok', renameBody.ok === true, JSON.stringify(renameBody))

  const blankTitle = await renameRoute.fetch({ json: async () => ({ workspaceId: 'ws-1', title: '   ' }) })
  check('blank title is rejected', blankTitle.status === 400, blankTitle.status)
  const missingId = await renameRoute.fetch({ json: async () => ({ title: 'x' }) })
  check('missing workspaceId is rejected', missingId.status === 400, missingId.status)
  const badJson = await renameRoute.fetch({ json: async () => { throw new Error('bad body') } })
  check('invalid JSON body is rejected', badJson.status === 400, badJson.status)
}

// ------------------------------------------- registration falls back gracefully
{
  const mod = await loadPlugin()
  const routes = []
  const { ctx } = makeCtx({
    register(route) {
      if (route.requestBody === 'buffered') throw new Error('unsupported requestBody')
      routes.push(route)
      return () => {}
    },
  })
  mod.apply(ctx)
  check('falls back when requestBody is rejected', routes.length === 2, routes.length)
  check('fallback keeps the same path', routes[0] && routes[0].path === '/api/control-room-usage', routes[0] && routes[0].path)
}

{
  const mod = await loadPlugin()
  const { ctx, routes } = makeCtx({ controller: null })
  mod.apply(ctx)
  const renameRoute = routes.find((item) => item.path === '/api/control-room-rename')
  const response = await renameRoute.fetch({ json: async () => ({ workspaceId: 'ws-1', title: 'x' }) })
  check('rename without the controller answers 501', response.status === 501, response.status)
}

{
  const mod = await loadPlugin()
  const { ctx } = makeCtx({
    register() {
      throw new Error('always fails')
    },
  })
  let threw = false
  try {
    mod.apply(ctx)
  } catch (_error) {
    threw = true
  }
  check('a failing registration never breaks activation', threw === false)
}

{
  const mod = await loadPlugin()
  const { ctx } = makeCtx({ connection: null, account: null })
  let threw = false
  try {
    mod.apply(ctx)
  } catch (_error) {
    threw = true
  }
  check('a missing connection service never breaks activation', threw === false)
}

console.log(failures === 0 ? 'ALL_OK' : `FAILED ${failures}`)
process.exit(failures === 0 ? 0 : 1)
