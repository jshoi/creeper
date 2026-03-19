'use client'

import { useEffect, useRef } from 'react'
import { GAME_HTML } from '@/components/gameHtml'
import { GAME_JS }   from '@/components/gameJs'

export default function GamePage() {
  const mounted = useRef(false)

  useEffect(() => {
    if (mounted.current) return
    mounted.current = true

    // ── Supabase 환경변수를 window 전역에 주입 (멀티플레이용) ──
    const envScript = document.createElement('script')
    envScript.textContent = [
      `window.__SB_URL__  = ${JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '')};`,
      `window.__SB_ANON__ = ${JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '')};`,
    ].join('\n')
    document.head.appendChild(envScript)

    // ── supabase-js CDN (window.supabase 전역 노출, 멀티플레이용) ──
    const sbScript = document.createElement('script')
    sbScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js'
    sbScript.async = true
    document.head.appendChild(sbScript)

    // ── 게임 스크립트 ──────────────────────────────────────────
    const gameScript = document.createElement('script')
    gameScript.textContent = GAME_JS

    // supabase-js 로드 완료 후 게임 실행 (멀티 기능 사용 가능)
    // supabase-js 로드 실패해도 게임은 싱글로 동작
    let gameLaunched = false
    const launchGame = () => {
      if (gameLaunched) return
      gameLaunched = true
      document.body.appendChild(gameScript)
    }
    sbScript.addEventListener('load',  launchGame)
    sbScript.addEventListener('error', launchGame)
    // 3초 후 아직 실행 안 됐으면 강제 실행
    const fallbackTimer = setTimeout(launchGame, 3000)

    return () => {
      clearTimeout(fallbackTimer)
      try { document.body.removeChild(gameScript) } catch {}
      try { document.head.removeChild(sbScript)   } catch {}
      try { document.head.removeChild(envScript)  } catch {}
    }
  }, [])

  return (
    <div
      id="game-root"
      dangerouslySetInnerHTML={{ __html: GAME_HTML }}
    />
  )
}
