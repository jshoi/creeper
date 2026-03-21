'use client'

import { useEffect, useRef } from 'react'
import { GAME_HTML } from '@/components/gameHtml'
import { GAME_JS }   from '@/components/gameJs'

// 빌드 시점 버전 (배포할 때마다 자동 갱신)
const BUILD_DATE = new Date().toISOString().slice(0, 10).replace(/-/g, '.')
const VERSION    = `v1.7.0 (${BUILD_DATE})`

export default function GamePage() {
  const launched = useRef(false)

  useEffect(() => {
    // StrictMode 이중 실행 방지 — 한 번만 실행
    if (launched.current) return
    launched.current = true

    // ── Supabase 환경변수를 window 전역에 주입 (멀티플레이용) ──
    const envScript = document.createElement('script')
    envScript.textContent = [
      `window.__SB_URL__  = ${JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '')};`,
      `window.__SB_ANON__ = ${JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '')};`,
      `window.__GAME_VERSION__ = ${JSON.stringify(VERSION)};`,
    ].join('\n')
    document.head.appendChild(envScript)

    // ── 버전 표시 주입 ──────────────────────────────────────────
    const verEl = document.getElementById('overlay-version')
    if (verEl) verEl.textContent = VERSION

    // ── supabase-js CDN (window.supabase 전역 노출, 멀티플레이용) ──
    const sbScript = document.createElement('script')
    sbScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js'
    sbScript.async = true
    document.head.appendChild(sbScript)

    // ── 게임 스크립트 ──────────────────────────────────────────
    // NOTE: cleanup에서 제거하면 이벤트 리스너가 날아가므로 제거하지 않음
    let gameLaunched = false
    const launchGame = () => {
      if (gameLaunched) return
      gameLaunched = true
      const gameScript = document.createElement('script')
      gameScript.textContent = GAME_JS
      document.body.appendChild(gameScript)
    }

    sbScript.addEventListener('load',  launchGame)
    sbScript.addEventListener('error', launchGame)
    // 3초 후 아직 실행 안 됐으면 강제 실행 (CDN 느릴 때 대비)
    const fallbackTimer = setTimeout(launchGame, 3000)

    return () => {
      clearTimeout(fallbackTimer)
      // sbScript, envScript만 정리 (gameScript는 DOM에 남겨 이벤트 보존)
      try { document.head.removeChild(sbScript)  } catch {}
      try { document.head.removeChild(envScript) } catch {}
    }
  }, [])

  return (
    <div
      id="game-root"
      dangerouslySetInnerHTML={{ __html: GAME_HTML }}
    />
  )
}
