// supabase/functions/submit-signup/index.ts
// Deploy with: npx supabase functions deploy submit-signup

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RATE_LIMIT = 2          // max submissions per IP
const WINDOW_HOURS = 24       // rolling window in hours

// Allowed origins — add your production domain here when you deploy
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://futureforge.vercel.app', // update to your real Vercel URL
]

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? ''
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

Deno.serve(async (req: Request) => {
  const cors = getCorsHeaders(req)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  // ── Extract IP ──────────────────────────────────────────────────────────────
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  // ── Parse body ──────────────────────────────────────────────────────────────
  let body: { name?: string; email?: string; timezone?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  const { name, email, timezone } = body

  if (!name || !email || !timezone) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  // Basic email format check server-side
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return new Response(JSON.stringify({ error: 'Invalid email address' }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  // ── Supabase admin client ───────────────────────────────────────────────────
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const windowStart = new Date(Date.now() - WINDOW_HOURS * 60 * 60 * 1000).toISOString()

  // ── Rate limit check ────────────────────────────────────────────────────────
  const { count, error: countError } = await supabase
    .from('signup_rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('created_at', windowStart)

  if (countError) {
    console.error('Rate limit check failed:', countError)
    return new Response(JSON.stringify({ error: 'Server error, please try again' }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  if ((count ?? 0) >= RATE_LIMIT) {
    const { data: oldest } = await supabase
      .from('signup_rate_limits')
      .select('created_at')
      .eq('ip', ip)
      .gte('created_at', windowStart)
      .order('created_at', { ascending: true })
      .limit(1)

    const retryAfter = oldest?.[0]?.created_at
      ? new Date(new Date(oldest[0].created_at).getTime() + WINDOW_HOURS * 60 * 60 * 1000)
      : null

    const retryMsg = retryAfter
      ? `You can try again after ${retryAfter.toUTCString()}.`
      : `Please wait ${WINDOW_HOURS} hours before submitting again.`

    return new Response(
      JSON.stringify({
        error: `Too many signups from your location. ${retryMsg}`,
        retryAfter: retryAfter?.toISOString() ?? null,
      }),
      {
        status: 429,
        headers: {
          ...cors,
          'Content-Type': 'application/json',
          'Retry-After': String(WINDOW_HOURS * 3600),
        },
      }
    )
  }

  // ── Duplicate email check ───────────────────────────────────────────────────
  const { data: existing } = await supabase
    .from('event_signups')
    .select('email')
    .eq('email', email.trim().toLowerCase())
    .limit(1)

  if (existing && existing.length > 0) {
    return new Response(
      JSON.stringify({ error: 'This email is already registered. See you at FutureForge!' }),
      {
        status: 409,
        headers: { ...cors, 'Content-Type': 'application/json' },
      }
    )
  }

  // ── Insert signup ───────────────────────────────────────────────────────────
  const { error: insertError } = await supabase.from('event_signups').insert({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    timezone,
    event: 'Future Forge',
    source: 'landing',
  })

  if (insertError) {
    if (insertError.code === '23505') {
      return new Response(
        JSON.stringify({ error: 'This email is already registered. See you at FutureForge!' }),
        {
          status: 409,
          headers: { ...cors, 'Content-Type': 'application/json' },
        }
      )
    }
    console.error('Insert error:', insertError)
    return new Response(JSON.stringify({ error: insertError.message }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  // ── Record this submission for rate limiting ────────────────────────────────
  await supabase.from('signup_rate_limits').insert({ ip })

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
})