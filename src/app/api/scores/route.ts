import { NextRequest, NextResponse } from 'next/server'
import { getSupabase, ScoreRow } from '@/lib/supabase'

// ── GET /api/scores ─────────────────────────────
export async function GET() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .order('score', { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, scores: data ?? [] })
}

// ── POST /api/scores ────────────────────────────
export async function POST(req: NextRequest) {
  let body: Partial<ScoreRow>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 })
  }

  const { name, score, stage = 1, caught = 0, erased = 0, mode = 'gameover' } = body

  if (!name || typeof score !== 'number') {
    return NextResponse.json({ ok: false, error: 'name and score required' }, { status: 400 })
  }

  const supabase = getSupabase()

  // 이름별 최고 점수 upsert (기존보다 높을 때만 갱신)
  const { data: existing } = await supabase
    .from('scores')
    .select('id, score')
    .eq('name', name)
    .maybeSingle()

  if (existing && existing.score >= score) {
    const { data: lb } = await supabase
      .from('scores')
      .select('*')
      .order('score', { ascending: false })
    const rank = (lb ?? []).findIndex((r: ScoreRow) => r.name === name) + 1
    return NextResponse.json({ ok: true, scores: lb ?? [], rank })
  }

  // upsert — name 컬럼 unique 인덱스 기반
  const { error: upsertErr } = await supabase
    .from('scores')
    .upsert(
      { name, score, stage, caught, erased, mode, date: new Date().toISOString() },
      { onConflict: 'name' }
    )

  if (upsertErr) {
    return NextResponse.json({ ok: false, error: upsertErr.message }, { status: 500 })
  }

  const { data: lb } = await supabase
    .from('scores')
    .select('*')
    .order('score', { ascending: false })

  const rank = (lb ?? []).findIndex((r: ScoreRow) => r.name === name) + 1
  console.log(`[SCORE] ${name} → ${score}점 (${rank}위)`)

  return NextResponse.json({ ok: true, scores: lb ?? [], rank })
}
