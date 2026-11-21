window.__ModuleLoader__.load({
  id: '@local/control-room',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useEffect, useMemo, useRef, useState } = React

    const NS = 'control-room'
    const PANEL_ID = 'control-room'

    const ZH = {
      panel: '控制室',
      title: '控制室',
      subtitle: '本地项目 · 多面板工作台',
      search: '搜索项目或路径',
      back: '返回对话',
      projects: '我的本地项目',
      toggleProjects: '项目',
      detail: '项目详情',
      overview: '概览',
      totalProjects: '本地项目',
      totalSessions: '关联会话',
      lastActive: '最近更新',
      sessions: '会话',
      path: '路径',
      created: '创建于',
      updated: '更新于',
      elapsed: '运行时长',
      enter: '进入项目',
      copyPath: '复制路径',
      copied: '已复制',
      running: '运行中',
      livePrefix: '对话进行中',
      emptyTitle: '还没有本地项目',
      emptyHint: '在侧边栏打开一个文件夹后，它会作为工作区登记在这里。',
      noMatch: '没有匹配的项目',
      recent: '最近更新',
      recentHint: '按更新时间排序',
      tipTitle: '关于控制室',
      tipBody: '数据来自 DSH 工作区；新建或移除项目仍在侧边栏完成。',
      timeNow: '刚刚',
      timeMin: ' 分钟前',
      timeHour: ' 小时前',
      timeDay: ' 天前',
      sessionsUnit: ' 个会话',
    }

    const EN = {
      panel: 'Control room',
      title: 'Control room',
      subtitle: 'Local projects · multi-panel bench',
      search: 'Search projects or paths',
      back: 'Back to chat',
      projects: 'My local projects',
      toggleProjects: 'Projects',
      detail: 'Project detail',
      overview: 'Overview',
      totalProjects: 'Projects',
      totalSessions: 'Sessions',
      lastActive: 'Last update',
      sessions: 'Sessions',
      path: 'Path',
      created: 'Created',
      updated: 'Updated',
      elapsed: 'Elapsed',
      enter: 'Open project',
      copyPath: 'Copy path',
      copied: 'Copied',
      running: 'Running',
      livePrefix: 'Conversation running',
      emptyTitle: 'No local projects yet',
      emptyHint: 'Open a folder in the sidebar and it is registered here as a workspace.',
      noMatch: 'No matching project',
      recent: 'Recently updated',
      recentHint: 'Sorted by update time',
      tipTitle: 'About the control room',
      tipBody: 'Data comes from DSH workspaces; create or remove projects in the sidebar.',
      timeNow: 'just now',
      timeMin: 'm ago',
      timeHour: 'h ago',
      timeDay: 'd ago',
      sessionsUnit: ' sessions',
    }

    const CSS = `
.cr-root{position:relative;display:flex;flex-direction:column;gap:14px;height:100%;min-height:0;padding:20px 22px 18px;box-sizing:border-box;overflow:hidden;color:var(--dsw-alias-label-primary);font-family:inherit;
  --cr-glass-top:light-dark(rgba(255,255,255,.62),rgba(255,255,255,.13));
  --cr-glass-mid:light-dark(rgba(255,255,255,.26),rgba(255,255,255,.05));
  --cr-glass-low:light-dark(rgba(255,255,255,.14),rgba(255,255,255,.03));
  --cr-glass-rim:light-dark(rgba(255,255,255,.92),rgba(255,255,255,.42));
  --cr-glass-edge:light-dark(rgba(255,255,255,.45),rgba(255,255,255,.16));
  --cr-tint:light-dark(color-mix(in srgb,#8ecbff 18%,transparent),color-mix(in srgb,#6aa8ff 14%,transparent));
  --cr-shadow:light-dark(rgba(31,86,255,.30),rgba(0,0,0,.55))}
.cr-root::before{content:'';position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(color-mix(in srgb,var(--dsw-alias-border-l1) 75%,transparent) 1px,transparent 1px);background-size:22px 22px;opacity:.4;-webkit-mask-image:linear-gradient(to bottom,#000,transparent 60%);mask-image:linear-gradient(to bottom,#000,transparent 60%)}
.cr-aura{position:absolute;inset:0 0 auto 0;height:300px;pointer-events:none;background:radial-gradient(58% 120% at 8% 0%,color-mix(in srgb,#6db4ff 24%,transparent),transparent 70%),radial-gradient(52% 110% at 92% -10%,color-mix(in srgb,#9a7bff 16%,transparent),transparent 72%),radial-gradient(40% 90% at 60% 12%,color-mix(in srgb,#8ef0ff 12%,transparent),transparent 75%)}
.cr-head{position:relative;display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex:0 0 auto}
.cr-titleWrap{min-width:0}
.cr-title{display:flex;align-items:center;gap:10px;font-size:20px;line-height:1.25;font-weight:600;letter-spacing:.2px}
.cr-dot{width:9px;height:9px;border-radius:50%;background:linear-gradient(135deg,#a9e0ff,#4d8dff);box-shadow:0 0 0 4px color-mix(in srgb,#7cc4ff 20%,transparent),0 0 14px color-mix(in srgb,#7cc4ff 55%,transparent)}
.cr-sub{margin-top:5px;font-size:12px;color:var(--dsw-alias-label-secondary)}
.cr-livePill{display:inline-flex;align-items:center;gap:7px;margin-top:7px;height:24px;padding:0 10px;border-radius:999px;border:1px solid color-mix(in srgb,#7cc4ff 40%,var(--dsw-alias-border-l1));background:linear-gradient(135deg,color-mix(in srgb,#8fd0ff 22%,transparent),color-mix(in srgb,#6aa8ff 8%,transparent));backdrop-filter:blur(10px) saturate(160%);font-size:11.5px;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-primary)}
.cr-liveDot{width:6px;height:6px;border-radius:50%;background:#3aa5ff;box-shadow:0 0 0 3px color-mix(in srgb,#3aa5ff 26%,transparent);animation:cr-dot 1.4s ease-in-out infinite}
.cr-headActions{display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:8px;flex:1 1 auto;min-width:0}
.cr-search{display:flex;align-items:center;gap:6px;height:32px;padding:0 10px;border-radius:10px;border:1px solid var(--cr-glass-edge);background:linear-gradient(160deg,var(--cr-glass-mid),var(--cr-glass-low));backdrop-filter:blur(14px) saturate(170%)}
.cr-search svg{flex:0 0 auto;color:var(--dsw-alias-label-secondary)}
.cr-search input{width:168px;border:0;outline:0;background:none;color:inherit;font:inherit;font-size:12.5px}
.cr-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:32px;padding:0 12px;border-radius:10px;border:1px solid var(--cr-glass-edge);background:linear-gradient(160deg,var(--cr-glass-mid),var(--cr-glass-low));color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;cursor:pointer;white-space:nowrap;backdrop-filter:blur(14px) saturate(170%);transition:background .15s ease,border-color .15s ease,transform .15s ease}
.cr-btn:hover{background:linear-gradient(160deg,var(--cr-glass-top),var(--cr-glass-mid));border-color:var(--cr-glass-rim)}
.cr-btn:active{transform:translateY(1px)}
.cr-btn[data-on="true"]{border-color:color-mix(in srgb,#7cc4ff 55%,var(--dsw-alias-border-l1));background:linear-gradient(160deg,color-mix(in srgb,#8fd0ff 28%,transparent),color-mix(in srgb,#6aa8ff 10%,transparent))}
.cr-btnPrimary{border-color:transparent;background:linear-gradient(135deg,#8fd3ff,#3f86ff);color:#fff;box-shadow:0 10px 24px -16px rgba(63,134,255,1),inset 0 1px 0 rgba(255,255,255,.55)}
.cr-btnPrimary:hover{background:linear-gradient(135deg,#a3dcff,#4a8eff)}
.cr-stats{position:relative;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;flex:0 0 auto}
.cr-stat{position:relative;overflow:hidden;padding:12px 14px;border-radius:16px;border:1px solid var(--cr-glass-edge);
  background:linear-gradient(150deg,var(--cr-glass-top),var(--cr-glass-mid) 46%,var(--cr-glass-low) 70%,var(--cr-glass-top)),var(--cr-tint);
  backdrop-filter:blur(20px) saturate(180%);
  box-shadow:inset 0 1px 0 var(--cr-glass-rim),inset 0 -1px 0 rgba(10,40,90,.08),0 14px 32px -24px var(--cr-shadow)}
.cr-stat::after{content:'';position:absolute;right:-18px;top:-26px;width:80px;height:80px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.5),transparent 68%);pointer-events:none}
.cr-statLabel{font-size:11px;letter-spacing:.4px;color:var(--dsw-alias-label-secondary)}
.cr-statValue{margin-top:4px;font-size:23px;line-height:1.15;font-weight:600;font-variant-numeric:tabular-nums}
.cr-body{position:relative;display:grid;gap:12px;flex:1 1 auto;min-height:0}
.cr-panel{display:flex;flex-direction:column;min-height:0;border-radius:18px;border:1px solid var(--cr-glass-edge);background:linear-gradient(160deg,var(--cr-glass-mid),var(--cr-glass-low) 70%);backdrop-filter:blur(18px) saturate(170%);overflow:hidden;box-shadow:inset 0 1px 0 var(--cr-glass-rim)}
.cr-panelHead{display:flex;align-items:center;gap:8px;flex:0 0 auto;padding:11px 13px;border-bottom:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 60%,transparent)}
.cr-panelTitle{font-size:11.5px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;color:var(--dsw-alias-label-secondary)}
.cr-chip{margin-left:auto;padding:2px 8px;border-radius:999px;font-size:11px;color:var(--dsw-alias-label-secondary);background:color-mix(in srgb,#7cc4ff 16%,transparent);font-variant-numeric:tabular-nums}
.cr-panelBody{display:flex;flex-direction:column;gap:9px;flex:1 1 auto;min-height:0;padding:10px;overflow:auto}
.cr-card{position:relative;isolation:isolate;display:flex;flex-direction:column;gap:9px;padding:12px 13px;border-radius:16px;border:1px solid var(--cr-glass-edge);cursor:pointer;color:inherit;font:inherit;text-align:left;
  background:
    radial-gradient(120% 90% at 18% -20%,var(--cr-glass-top),transparent 58%),
    linear-gradient(150deg,var(--cr-glass-mid),var(--cr-glass-low) 62%,var(--cr-glass-mid)),
    var(--cr-tint);
  backdrop-filter:blur(22px) saturate(185%);
  -webkit-backdrop-filter:blur(22px) saturate(185%);
  box-shadow:
    inset 0 1px 0 var(--cr-glass-rim),
    inset 0 -1px 0 rgba(10,40,90,.10),
    inset 0 0 26px rgba(255,255,255,.10),
    0 16px 34px -24px var(--cr-shadow);
  transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}
.cr-card::before{content:'';position:absolute;inset:0;border-radius:inherit;padding:1px;pointer-events:none;z-index:2;
  background:linear-gradient(150deg,var(--cr-glass-rim),transparent 32%,transparent 62%,color-mix(in srgb,#b7ddff 70%,transparent) 88%,var(--cr-glass-rim));
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude}
.cr-card::after{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:1;
  background:radial-gradient(90% 60% at 22% 0%,rgba(255,255,255,.55),transparent 60%),linear-gradient(to top,rgba(255,255,255,.16),transparent 42%);
  opacity:.55;transition:opacity .18s ease}
.cr-card:hover{transform:translateY(-2px);border-color:var(--cr-glass-rim);box-shadow:inset 0 1px 0 #fff,inset 0 -1px 0 rgba(10,40,90,.10),inset 0 0 30px rgba(255,255,255,.16),0 22px 42px -24px var(--cr-shadow)}
.cr-card:hover::after{opacity:.8}
.cr-card:focus-visible{outline:2px solid color-mix(in srgb,#7cc4ff 75%,transparent);outline-offset:2px}
.cr-card[data-active="true"]{border-color:color-mix(in srgb,#9ad6ff 65%,var(--cr-glass-rim));background:radial-gradient(120% 90% at 18% -20%,var(--cr-glass-top),transparent 58%),linear-gradient(150deg,color-mix(in srgb,#8fd0ff 26%,transparent),color-mix(in srgb,#6aa8ff 8%,transparent) 66%,transparent),var(--cr-glass-low)}
.cr-card[data-running="true"]{border-color:color-mix(in srgb,#8fd0ff 62%,var(--dsw-alias-border-l1));animation:cr-breathe 1.9s ease-in-out infinite}
.cr-cardTop{display:flex;align-items:center;gap:8px;min-width:0;position:relative;z-index:3}
.cr-avatar{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:26px;height:26px;border-radius:9px;font-size:12px;font-weight:600;color:#fff;background:linear-gradient(135deg,#a9e0ff,#4d8dff);box-shadow:inset 0 1px 0 rgba(255,255,255,.7),0 6px 14px -8px rgba(63,134,255,.9)}
.cr-name{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:600}
.cr-count{flex:0 0 auto;padding:1px 7px;border-radius:999px;font-size:10.5px;color:var(--dsw-alias-label-secondary);background:color-mix(in srgb,#7cc4ff 18%,transparent);font-variant-numeric:tabular-nums}
.cr-cardMeta{display:flex;align-items:center;gap:8px;min-height:24px;position:relative;z-index:3}
.cr-time{font-size:11px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.cr-live{display:inline-flex;align-items:center;gap:5px;padding:1px 7px;border-radius:999px;font-size:10.5px;font-variant-numeric:tabular-nums;color:color-mix(in srgb,#1f7ae0 70%,var(--dsw-alias-label-primary));background:color-mix(in srgb,#7cc4ff 24%,transparent);border:1px solid color-mix(in srgb,#7cc4ff 42%,transparent)}
.cr-liveDot{width:5px;height:5px;border-radius:50%;background:#2f9bff;animation:cr-dot 1.4s ease-in-out infinite}
.cr-cardActions{display:flex;gap:6px;margin-left:auto;opacity:0;transform:translateX(4px);transition:opacity .16s ease,transform .16s ease}
.cr-card:hover .cr-cardActions,.cr-card:focus-within .cr-cardActions{opacity:1;transform:none}
.cr-mini{height:24px;padding:0 9px;border-radius:8px;border:1px solid var(--cr-glass-edge);background:linear-gradient(160deg,var(--cr-glass-mid),var(--cr-glass-low));color:var(--dsw-alias-label-primary);font:inherit;font-size:11px;cursor:pointer;white-space:nowrap;backdrop-filter:blur(8px)}
.cr-mini:hover{border-color:var(--cr-glass-rim);background:linear-gradient(160deg,var(--cr-glass-top),var(--cr-glass-mid))}
.cr-hero{position:relative;isolation:isolate;overflow:hidden;display:flex;flex-direction:column;gap:12px;padding:15px;border-radius:16px;border:1px solid var(--cr-glass-edge);
  background:radial-gradient(120% 80% at 15% -10%,var(--cr-glass-top),transparent 55%),linear-gradient(150deg,color-mix(in srgb,#8fd0ff 22%,transparent),var(--cr-glass-low) 62%,transparent),var(--cr-glass-mid);
  backdrop-filter:blur(22px) saturate(180%);
  box-shadow:inset 0 1px 0 var(--cr-glass-rim),0 18px 38px -30px var(--cr-shadow)}
.cr-hero::after{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(to top,rgba(255,255,255,.18),transparent 45%);opacity:.7}
.cr-heroTop{display:flex;align-items:flex-start;gap:10px;min-width:0;position:relative;z-index:2}
.cr-heroBadge{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:38px;height:38px;border-radius:12px;font-size:16px;font-weight:600;color:#fff;background:linear-gradient(135deg,#a9e0ff,#4d8dff);box-shadow:inset 0 1px 0 rgba(255,255,255,.7),0 10px 20px -12px rgba(63,134,255,1)}
.cr-heroName{font-size:16px;font-weight:600;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cr-heroPath{margin-top:3px;font-size:11px;color:var(--dsw-alias-label-secondary);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;word-break:break-all}
.cr-heroActions{display:flex;flex-wrap:wrap;gap:8px;position:relative;z-index:2}
.cr-info{display:flex;flex-direction:column;gap:2px;padding:12px 13px;border-radius:14px;border:1px solid var(--cr-glass-edge);background:linear-gradient(160deg,var(--cr-glass-low),transparent)}
.cr-infoRow{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:7px 0;font-size:12px;border-bottom:1px dashed color-mix(in srgb,var(--dsw-alias-border-l1) 75%,transparent)}
.cr-infoRow:last-child{border-bottom:0}
.cr-infoLabel{color:var(--dsw-alias-label-secondary)}
.cr-infoValue{text-align:right;font-variant-numeric:tabular-nums;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cr-recent{display:flex;flex-direction:column;gap:6px}
.cr-recentItem{display:flex;flex-direction:column;gap:2px;width:100%;padding:8px 9px;border-radius:10px;border:1px solid transparent;background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 38%,transparent);color:inherit;font:inherit;text-align:left;cursor:pointer;transition:border-color .15s ease,background .15s ease}
.cr-recentItem:hover{border-color:color-mix(in srgb,#7cc4ff 42%,var(--dsw-alias-border-l1));background:color-mix(in srgb,#7cc4ff 14%,transparent)}
.cr-recentName{font-size:12px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cr-recentMeta{font-size:10.5px;color:var(--dsw-alias-label-secondary)}
.cr-tip{padding:10px 11px;border-radius:12px;border:1px dashed color-mix(in srgb,#7cc4ff 36%,var(--dsw-alias-border-l1));background:color-mix(in srgb,#7cc4ff 8%,transparent);font-size:11px;line-height:1.55;color:var(--dsw-alias-label-secondary)}
.cr-tipTitle{margin-bottom:3px;font-size:11.5px;font-weight:600;color:var(--dsw-alias-label-primary)}
.cr-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;flex:1 1 auto;padding:40px 20px;text-align:center}
.cr-emptyIcon{display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:15px;border:1px solid var(--cr-glass-edge);background:linear-gradient(150deg,var(--cr-glass-top),var(--cr-glass-low));backdrop-filter:blur(16px);color:color-mix(in srgb,#4d8dff 75%,var(--dsw-alias-label-primary));box-shadow:inset 0 1px 0 var(--cr-glass-rim)}
.cr-emptyTitle{font-size:13.5px;font-weight:600}
.cr-emptyHint{max-width:320px;font-size:12px;line-height:1.6;color:var(--dsw-alias-label-secondary)}
.cr-sideEntry{display:flex;align-items:center;gap:8px;width:100%;height:32px;padding:0 8px;border-radius:8px;border:1px solid transparent;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;cursor:pointer;text-align:left}
.cr-sideEntry:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 8%,transparent)}
.cr-sideEntry:focus-visible{outline:2px solid color-mix(in srgb,#7cc4ff 72%,transparent);outline-offset:1px}
.cr-sideEntry[data-rail="true"]{justify-content:center;padding:0}
.cr-sideIcon{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:16px;height:16px;color:color-mix(in srgb,#4d8dff 70%,var(--dsw-alias-label-primary))}
.cr-sideLabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@keyframes cr-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.78)}}
@keyframes cr-breathe{0%,100%{box-shadow:inset 0 1px 0 var(--cr-glass-rim),0 0 0 1px color-mix(in srgb,#7cc4ff 22%,transparent),0 16px 34px -24px var(--cr-shadow)}50%{box-shadow:inset 0 1px 0 var(--cr-glass-rim),0 0 0 3px color-mix(in srgb,#7cc4ff 30%,transparent),0 0 26px -4px color-mix(in srgb,#6db4ff 62%,transparent)}}
@media (prefers-reduced-motion: reduce){.cr-card[data-running="true"]{animation:none}.cr-liveDot,.cr-livePill .cr-liveDot{animation:none}}
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

    function SearchIcon() {
      return h('svg', {
        width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round',
        'aria-hidden': 'true',
      },
        h('circle', { cx: 7, cy: 7, r: 4.4 }),
        h('path', { d: 'M10.4 10.4 14 14' }),
      )
    }

    function initialOf(text) {
      const clean = String(text || '').trim()
      if (clean === '') return '·'
      const first = Array.from(clean)[0]
      return /[a-z]/i.test(first) ? first.toUpperCase() : first
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
      const { workspace, active, t, runningStart, now, onSelect, onEnter } = props
      const sessions = workspace.sessionIds ? workspace.sessionIds.length : 0
      const onKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
      }
      return h('div', {
        className: 'cr-card',
        role: 'button',
        tabIndex: 0,
        'data-active': active ? 'true' : 'false',
        'data-running': runningStart === null || runningStart === undefined ? 'false' : 'true',
        'aria-pressed': active ? 'true' : 'false',
        'aria-label': workspace.title,
        onClick: onSelect,
        onKeyDown,
      },
        h('div', { className: 'cr-cardTop' },
          h('span', { className: 'cr-avatar' }, initialOf(workspace.title)),
          h('span', { className: 'cr-name' }, workspace.title),
          h('span', { className: 'cr-count' }, String(sessions)),
        ),
        h('div', { className: 'cr-cardMeta' },
          runningStart === null || runningStart === undefined
            ? h('span', { className: 'cr-time' }, timeAgo(workspace.updatedAt, t))
            : h('span', { className: 'cr-live' },
              h('span', { className: 'cr-liveDot', 'aria-hidden': 'true' }),
              t('running') + ' · ' + formatDuration(now - runningStart),
            ),
          h('span', { className: 'cr-cardActions' },
            h('button', {
              type: 'button', className: 'cr-mini',
              onClick: (event) => { event.stopPropagation(); onEnter() },
            }, t('enter')),
          ),
        ),
      )
    }

    function ControlRoomPage(props) {
      const t = props.t || ((key) => key)
      const snapshot = props.useWorkspaces((value) => value)
      const workspaces = (snapshot && snapshot.items) || []
      const useSessions = props.useSessions || ((selector) => selector(null))
      const sessionState = useSessions((value) => value)
      const [query, setQuery] = useState('')
      const [selectedId, setSelectedId] = useState(null)
      const [panels, setPanels] = useState({ projects: true, overview: true })
      const [copied, setCopied] = useState(false)
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

      const stats = useMemo(() => {
        const sessions = workspaces.reduce((sum, item) => sum + (item.sessionIds ? item.sessionIds.length : 0), 0)
        let newest = ''
        let newestTime = -Infinity
        for (const item of workspaces) {
          const at = Date.parse(item.updatedAt)
          if (Number.isFinite(at) && at > newestTime) {
            newestTime = at
            newest = item.updatedAt
          }
        }
        return { sessions, newest }
      }, [workspaces])

      const runningByWorkspace = useMemo(() => {
        const map = {}
        for (const workspace of workspaces) {
          const ids = (workspace.sessionIds || []).filter((id) => Boolean(byId[id] && byId[id].running))
          if (ids.length === 0) continue
          const stamps = ids.map((id) => startsRef.current[id] || now)
          map[workspace.workspaceId] = Math.min.apply(null, stamps)
        }
        return map
      }, [workspaces, runningKey, now])

      const liveStart = useMemo(() => {
        const stamps = Object.keys(runningByWorkspace).map((key) => runningByWorkspace[key])
        return stamps.length === 0 ? null : Math.min.apply(null, stamps)
      }, [runningByWorkspace])

      const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase()
        if (needle === '') return workspaces
        return workspaces.filter((item) => (
          String(item.title || '').toLowerCase().includes(needle)
          || String(item.path || '').toLowerCase().includes(needle)
        ))
      }, [workspaces, query])

      const selected = useMemo(() => {
        if (filtered.length === 0) return null
        const found = filtered.find((item) => item.workspaceId === selectedId)
        return found || filtered[0]
      }, [filtered, selectedId])

      const recent = useMemo(() => {
        return workspaces.slice()
          .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt))
          .slice(0, 3)
      }, [workspaces])

      const toggle = (key) => {
        setPanels((current) => ({ ...current, [key]: !current[key] }))
      }

      const copyPath = () => {
        if (selected === null) return
        const done = () => {
          setCopied(true)
          window.setTimeout(() => { setCopied(false) }, 1600)
        }
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(selected.path).then(done, () => {})
            return
          }
        } catch (_error) {}
        try {
          const area = document.createElement('textarea')
          area.value = selected.path
          area.setAttribute('readonly', '')
          area.style.position = 'fixed'
          area.style.opacity = '0'
          document.body.appendChild(area)
          area.select()
          document.execCommand('copy')
          document.body.removeChild(area)
          done()
        } catch (_error) {}
      }

      const columns = panels.projects && panels.overview
        ? 'minmax(0,1.05fr) minmax(0,1.45fr) 252px'
        : panels.projects
          ? 'minmax(0,1fr) minmax(0,1.6fr)'
          : panels.overview
            ? 'minmax(0,1.6fr) 252px'
            : 'minmax(0,1fr)'

      const projectPanel = h('section', { className: 'cr-panel' },
        h('header', { className: 'cr-panelHead' },
          h('span', { className: 'cr-panelTitle' }, t('projects')),
          h('span', { className: 'cr-chip' }, String(filtered.length)),
        ),
        h('div', { className: 'cr-panelBody' },
          filtered.length === 0
            ? h('div', { className: 'cr-empty' },
              h('span', { className: 'cr-emptyTitle' }, query.trim() === '' ? t('emptyTitle') : t('noMatch')),
              query.trim() === '' ? h('span', { className: 'cr-emptyHint' }, t('emptyHint')) : null,
            )
            : filtered.map((workspace) => h(ProjectCard, {
              key: workspace.workspaceId,
              workspace,
              active: selected !== null && selected.workspaceId === workspace.workspaceId,
              t,
              now,
              runningStart: Object.prototype.hasOwnProperty.call(runningByWorkspace, workspace.workspaceId)
                ? runningByWorkspace[workspace.workspaceId]
                : null,
              onSelect: () => { setSelectedId(workspace.workspaceId) },
              onEnter: () => { props.openProject(workspace.workspaceId) },
            })),
        ),
      )

      const selectedRunningStart = selected !== null && Object.prototype.hasOwnProperty.call(runningByWorkspace, selected.workspaceId)
        ? runningByWorkspace[selected.workspaceId]
        : null

      const detailPanel = h('section', { className: 'cr-panel' },
        h('header', { className: 'cr-panelHead' },
          h('span', { className: 'cr-panelTitle' }, t('detail')),
        ),
        h('div', { className: 'cr-panelBody' },
          selected === null
            ? h('div', { className: 'cr-empty' },
              h('span', { className: 'cr-emptyTitle' }, t('emptyTitle')),
              h('span', { className: 'cr-emptyHint' }, t('emptyHint')),
            )
            : h(React.Fragment, null,
              h('div', { className: 'cr-hero' },
                h('div', { className: 'cr-heroTop' },
                  h('span', { className: 'cr-heroBadge' }, initialOf(selected.title)),
                  h('div', { style: { minWidth: 0 } },
                    h('div', { className: 'cr-heroName', title: selected.title }, selected.title),
                    h('div', { className: 'cr-heroPath' }, selected.path),
                  ),
                ),
                h('div', { className: 'cr-heroActions' },
                  h('button', {
                    type: 'button', className: 'cr-btn cr-btnPrimary',
                    onClick: () => { props.openProject(selected.workspaceId) },
                  }, t('enter')),
                  h('button', {
                    type: 'button', className: 'cr-btn',
                    onClick: copyPath,
                  }, copied ? t('copied') : t('copyPath')),
                ),
              ),
              h('div', { className: 'cr-info' },
                h('div', { className: 'cr-infoRow' },
                  h('span', { className: 'cr-infoLabel' }, t('sessions')),
                  h('span', { className: 'cr-infoValue' },
                    String(selected.sessionIds ? selected.sessionIds.length : 0) + t('sessionsUnit')),
                ),
                h('div', { className: 'cr-infoRow' },
                  h('span', { className: 'cr-infoLabel' }, t('created')),
                  h('span', { className: 'cr-infoValue' }, new Date(selected.createdAt).toLocaleString()),
                ),
                h('div', { className: 'cr-infoRow' },
                  h('span', { className: 'cr-infoLabel' }, t('updated')),
                  h('span', { className: 'cr-infoValue' }, timeAgo(selected.updatedAt, t)),
                ),
                selectedRunningStart === null
                  ? null
                  : h('div', { className: 'cr-infoRow' },
                    h('span', { className: 'cr-infoLabel' }, t('elapsed')),
                    h('span', { className: 'cr-infoValue' }, formatDuration(now - selectedRunningStart)),
                  ),
              ),
            ),
        ),
      )

      const overviewPanel = h('section', { className: 'cr-panel' },
        h('header', { className: 'cr-panelHead' },
          h('span', { className: 'cr-panelTitle' }, t('overview')),
          h('span', { className: 'cr-chip' }, t('recentHint')),
        ),
        h('div', { className: 'cr-panelBody' },
          h('div', { className: 'cr-recent' },
            recent.map((workspace) => h('button', {
              key: workspace.workspaceId,
              type: 'button',
              className: 'cr-recentItem',
              onClick: () => { setSelectedId(workspace.workspaceId) },
            },
              h('span', { className: 'cr-recentName' }, workspace.title),
              h('span', { className: 'cr-recentMeta' }, timeAgo(workspace.updatedAt, t)),
            )),
          ),
          h('div', { className: 'cr-tip' },
            h('div', { className: 'cr-tipTitle' }, t('tipTitle')),
            h('div', null, t('tipBody')),
          ),
        ),
      )

      return h('div', { className: 'cr-root' },
        h(Styles),
        h('div', { className: 'cr-aura', 'aria-hidden': 'true' }),
        h('header', { className: 'cr-head' },
          h('div', { className: 'cr-titleWrap' },
            h('div', { className: 'cr-title' },
              h('span', { className: 'cr-dot', 'aria-hidden': 'true' }),
              t('title'),
            ),
            h('div', { className: 'cr-sub' }, t('subtitle')),
            liveStart === null
              ? null
              : h('div', { className: 'cr-livePill' },
                h('span', { className: 'cr-liveDot', 'aria-hidden': 'true' }),
                t('livePrefix') + ' ' + formatDuration(now - liveStart),
              ),
          ),
          h('div', { className: 'cr-headActions' },
            h('label', { className: 'cr-search' },
              h(SearchIcon),
              h('input', {
                type: 'search',
                value: query,
                placeholder: t('search'),
                'aria-label': t('search'),
                onChange: (event) => { setQuery(event.currentTarget.value) },
              }),
            ),
            h('button', {
              type: 'button',
              className: 'cr-btn',
              'data-on': panels.projects ? 'true' : 'false',
              onClick: () => { toggle('projects') },
            }, t('toggleProjects')),
            h('button', {
              type: 'button',
              className: 'cr-btn',
              'data-on': panels.overview ? 'true' : 'false',
              onClick: () => { toggle('overview') },
            }, t('overview')),
            h('button', {
              type: 'button',
              className: 'cr-btn',
              onClick: () => { props.backToChat() },
            }, t('back')),
          ),
        ),
        h('div', { className: 'cr-stats' },
          h('div', { className: 'cr-stat' },
            h('div', { className: 'cr-statLabel' }, t('totalProjects')),
            h('div', { className: 'cr-statValue' }, String(workspaces.length)),
          ),
          h('div', { className: 'cr-stat' },
            h('div', { className: 'cr-statLabel' }, t('totalSessions')),
            h('div', { className: 'cr-statValue' }, String(stats.sessions)),
          ),
          h('div', { className: 'cr-stat' },
            h('div', { className: 'cr-statLabel' }, t('lastActive')),
            h('div', { className: 'cr-statValue', style: { fontSize: 16 } },
              stats.newest === '' ? '—' : timeAgo(stats.newest, t)),
          ),
        ),
        workspaces.length === 0
          ? h('section', { className: 'cr-panel' },
            h('div', { className: 'cr-empty' },
              h('span', { className: 'cr-emptyIcon' }, h(Icon, { size: 22 })),
              h('span', { className: 'cr-emptyTitle' }, t('emptyTitle')),
              h('span', { className: 'cr-emptyHint' }, t('emptyHint')),
            ),
          )
          : h('div', { className: 'cr-body', style: { gridTemplateColumns: columns } },
            panels.projects ? projectPanel : null,
            detailPanel,
            panels.overview ? overviewPanel : null,
          ),
      )
    }

    function SidebarEntry(props) {
      const wide = props.wide !== false
      return h(React.Fragment, null,
        h(Styles),
        h('button', {
          type: 'button',
          className: 'cr-sideEntry',
          'data-rail': wide ? 'false' : 'true',
          title: props.label,
          'aria-label': props.label,
          onClick: () => { props.open() },
        },
          h('span', { className: 'cr-sideIcon' }, h(Icon, { size: 16 })),
          wide ? h('span', { className: 'cr-sideLabel' }, props.label) : null,
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
            backToChat: () => {
              try {
                ctx.layout.selectPanel('conversation')
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
