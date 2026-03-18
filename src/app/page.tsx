'use client'

import { useEffect, useRef } from 'react'
import { GAME_HTML } from '@/components/gameHtml'
import { GAME_JS }   from '@/components/gameJs'

export default function GamePage() {
  const mounted = useRef(false)

  useEffect(() => {
    if (mounted.current) return
    mounted.current = true

    const script = document.createElement('script')
    script.textContent = GAME_JS
    document.body.appendChild(script)

    return () => {
      try { document.body.removeChild(script) } catch {}
    }
  }, [])

  return (
    <div
      id="game-root"
      dangerouslySetInnerHTML={{ __html: GAME_HTML }}
    />
  )
}
