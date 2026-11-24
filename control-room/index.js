/**
 * Host half of the Control room bundle.
 *
 * The account dialog needs data the browser cannot read: real token counts live
 * in the Host's session logs, and the account service only exists on the Host.
 * This half registers one exact Fetch route that the Client calls:
 *
 *   GET /api/control-room-usage?scale=day|week|month
 *
 * Connection answers 403 to any non-owner Peer, so a remote browser cannot read
 * another user's usage through it.
 */
import { scanUsage, readBalance, dshHome, writeStatus } from './usage.js'

export const name = 'control-room-usage'

/** The route needs the Host connection service that owns exact Fetch routes. */
export const inject = ['connection']

const SCALES = { day: 1, week: 7, month: 30 }
const ROUTE_PATH = '/api/control-room-usage'
const RENAME_PATH = '/api/control-room-rename'
const CACHE_MS = 30000

const cache = { at: 0, key: '', payload: null }

// Written to `<dsh home>/control-room-host.json` so activation and calls can be
// diagnosed without a browser or a log file.
const status = { registered: false, renameRegistered: false, renameAvailable: false, route: ROUTE_PATH, error: null, calls: 0, lastCall: null }

function flushStatus() {
  writeStatus({
    registered: status.registered,
    renameRegistered: status.renameRegistered,
    renameAvailable: status.renameAvailable,
    route: status.route,
    error: status.error,
    calls: status.calls,
    lastCall: status.lastCall,
    node: process.version,
  })
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}

function messageOf(error) {
  if (!error) return 'unknown error'
  return typeof error.message === 'string' ? error.message : String(error)
}

export function apply(ctx) {
  ctx.effect(() => {
    const connection = (typeof ctx.get === 'function' ? ctx.get('connection') : null) || ctx.connection
    if (!connection || !connection.fetch || typeof connection.fetch.register !== 'function') {
      console.warn('[control-room] Host connection.fetch is unavailable; usage route not registered')
      return () => {}
    }

    const handler = async (request) => {
      let url
      try {
        url = new URL(request.url)
      } catch (_error) {
        return jsonResponse({ ok: false, error: 'invalid request url' }, 400)
      }

      const scale = url.searchParams.get('scale') || 'month'
      const days = SCALES[scale] || SCALES.month
      const key = scale + ':' + days

      try {
        let usage
        if (cache.payload && cache.key === key && Date.now() - cache.at < CACHE_MS) {
          usage = cache.payload
        } else {
          usage = scanUsage({ sinceMs: Date.now() - days * 86400000 })
          cache.at = Date.now()
          cache.key = key
          cache.payload = usage
        }

        let balance = null
        try {
          balance = await readBalance(ctx)
        } catch (_error) {
          balance = null
        }

        status.calls += 1
        status.lastCall = {
          at: new Date().toISOString(),
          scale,
          net: usage && usage.tokens ? usage.tokens.net : null,
          total: usage && usage.tokens ? usage.tokens.total : null,
          hasBalance: balance !== null,
        }
        flushStatus()

        return jsonResponse({
          ok: true,
          scale,
          days,
          home: dshHome(),
          usage,
          balance,
        })
      } catch (error) {
        return jsonResponse({ ok: false, error: messageOf(error) }, 500)
      }
    }

    // Rename reaches the real workspace record, so the sidebar entry changes too.
    const renameHandler = async (request) => {
      let body = null
      try {
        body = await request.json()
      } catch (_error) {
        return jsonResponse({ ok: false, error: 'invalid JSON body' }, 400)
      }
      const workspaceId = body && typeof body.workspaceId === 'string' ? body.workspaceId : ''
      const title = body && typeof body.title === 'string' ? body.title.trim() : ''
      if (workspaceId === '') return jsonResponse({ ok: false, error: 'workspaceId is required' }, 400)
      if (title === '') return jsonResponse({ ok: false, error: 'title is required' }, 400)

      const controller = typeof ctx.get === 'function' ? ctx.get('workspaceController') : null
      if (!controller || typeof controller.rename !== 'function') {
        return jsonResponse({ ok: false, error: 'workspace rename is unavailable' }, 501)
      }

      try {
        const result = await controller.rename({ workspaceId, title })
        status.renameCalls = (status.renameCalls || 0) + 1
        status.lastRename = { at: new Date().toISOString(), workspaceId, title }
        flushStatus()
        return jsonResponse({ ok: true, workspace: result && result.workspace ? result.workspace : null })
      } catch (error) {
        return jsonResponse({ ok: false, error: messageOf(error) }, 400)
      }
    }

    // The request-body mode accepted by Connection changed across releases; try
    // the documented shape, then the same route without it, then the stream mode.
    const register = (base) => {
      const variants = [
        { ...base, requestBody: 'buffered' },
        { ...base },
        { ...base, requestBody: 'stream' },
      ]
      let lastError = null
      for (const route of variants) {
        try {
          return { dispose: connection.fetch.register(route), error: null }
        } catch (error) {
          lastError = error
        }
      }
      return { dispose: null, error: lastError }
    }

    const usageRoute = register({ path: ROUTE_PATH, methods: ['GET'], fetch: handler })
    const renameRoute = register({ path: RENAME_PATH, methods: ['POST'], fetch: renameHandler })

    status.registered = usageRoute.dispose !== null
    status.renameRegistered = renameRoute.dispose !== null
    status.error = usageRoute.error === null ? null : messageOf(usageRoute.error)
    // Record whether the Host actually exposes the controller, so a rename failure
    // can be told apart from a missing service without opening a browser.
    const controllerProbe = typeof ctx.get === 'function' ? ctx.get('workspaceController') : null
    status.renameAvailable = !!(controllerProbe && typeof controllerProbe.rename === 'function')
    flushStatus()

    if (usageRoute.dispose === null) {
      console.warn('[control-room] registering the usage route failed:', messageOf(usageRoute.error))
    }
    if (renameRoute.dispose === null) {
      console.warn('[control-room] registering the rename route failed:', messageOf(renameRoute.error))
    }
    if (usageRoute.dispose !== null) {
      console.log('[control-room] usage route registered at ' + ROUTE_PATH + ' (logs: ' + dshHome() + ')')
    }

    return () => {
      for (const entry of [usageRoute, renameRoute]) {
        if (typeof entry.dispose === 'function') entry.dispose()
      }
    }
  }, 'control-room: usage route')
}
