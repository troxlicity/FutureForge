import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowRight, Check, Loader2, TriangleAlert, User, Mail, Globe } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

// ─── Timezone data ────────────────────────────────────────────────────────────
const TIMEZONES = [
  { label: 'EST', full: 'Eastern Standard Time', offset: 'UTC−5', iana: 'America/New_York', region: 'Americas' },
  { label: 'CST', full: 'Central Standard Time', offset: 'UTC−6', iana: 'America/Chicago', region: 'Americas' },
  { label: 'MST', full: 'Mountain Standard Time', offset: 'UTC−7', iana: 'America/Denver', region: 'Americas' },
  { label: 'PST', full: 'Pacific Standard Time', offset: 'UTC−8', iana: 'America/Los_Angeles', region: 'Americas' },
  { label: 'AKST', full: 'Alaska Standard Time', offset: 'UTC−9', iana: 'America/Anchorage', region: 'Americas' },
  { label: 'HST', full: 'Hawaii Standard Time', offset: 'UTC−10', iana: 'Pacific/Honolulu', region: 'Pacific' },
  { label: 'GMT', full: 'Greenwich Mean Time', offset: 'UTC±0', iana: 'Europe/London', region: 'Europe' },
  { label: 'CET', full: 'Central European Time', offset: 'UTC+1', iana: 'Europe/Paris', region: 'Europe' },
  { label: 'EET', full: 'Eastern European Time', offset: 'UTC+2', iana: 'Europe/Athens', region: 'Europe' },
  { label: 'MSK', full: 'Moscow Standard Time', offset: 'UTC+3', iana: 'Europe/Moscow', region: 'Europe' },
  { label: 'IST', full: 'India Standard Time', offset: 'UTC+5:30', iana: 'Asia/Kolkata', region: 'Asia' },
  { label: 'CST+8', full: 'China Standard Time', offset: 'UTC+8', iana: 'Asia/Shanghai', region: 'Asia' },
  { label: 'JST', full: 'Japan Standard Time', offset: 'UTC+9', iana: 'Asia/Tokyo', region: 'Asia' },
  { label: 'AEST', full: 'Australian Eastern Time', offset: 'UTC+10', iana: 'Australia/Sydney', region: 'Pacific' },
  { label: 'NZST', full: 'New Zealand Standard Time', offset: 'UTC+12', iana: 'Pacific/Auckland', region: 'Pacific' },
  { label: 'BRT', full: 'Brasília Time', offset: 'UTC−3', iana: 'America/Sao_Paulo', region: 'Americas' },
  { label: 'ART', full: 'Argentina Time', offset: 'UTC−3', iana: 'America/Argentina/Buenos_Aires', region: 'Americas' },
  { label: 'WAT', full: 'West Africa Time', offset: 'UTC+1', iana: 'Africa/Lagos', region: 'Africa' },
  { label: 'EAT', full: 'East Africa Time', offset: 'UTC+3', iana: 'Africa/Nairobi', region: 'Africa' },
  { label: 'SGT', full: 'Singapore Time', offset: 'UTC+8', iana: 'Asia/Singapore', region: 'Asia' },
]

function getDefaultTz() {
  try {
    const iana = Intl.DateTimeFormat().resolvedOptions().timeZone
    const match = TIMEZONES.find(t => t.iana === iana)
    return match?.label ?? 'EST'
  } catch {
    return 'EST'
  }
}

// ─── Validation ───────────────────────────────────────────────────────────────
const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())

// ─── Animated floating label field ───────────────────────────────────────────
function Field({
  icon: Icon, label, value, onChange, type = 'text', placeholder, valid, touched,
}: {
  icon: React.ElementType; label: string; value: string; onChange: (v: string) => void
  type?: string; placeholder: string; valid: boolean; touched: boolean
}) {
  const [focused, setFocused] = useState(false)
  const floated = focused || value.length > 0

  const borderColor = touched && !valid
    ? 'rgba(239,68,68,0.5)'
    : focused
    ? '#15803d'
    : valid && touched
    ? '#22c55e'
    : 'rgba(187,247,208,0.8)'

  const shadow = focused
    ? `0 0 0 3px ${valid || !touched ? 'rgba(22,163,74,0.12)' : 'rgba(239,68,68,0.1)'}`
    : 'none'

  return (
    <div className="relative">
      <div
        className="relative rounded-xl overflow-hidden transition-all duration-200"
        style={{ border: `1.5px solid ${borderColor}`, boxShadow: shadow, background: 'rgba(255,255,255,0.7)' }}
      >
        {/* Floating label */}
        <motion.label
          animate={{ y: floated ? -8 : 10, scale: floated ? 0.72 : 1, x: floated ? 0 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="absolute left-10 top-0 origin-left pointer-events-none font-bold tracking-widest uppercase z-10"
          style={{ color: focused ? '#15803d' : '#4d7c0f', fontSize: '0.65rem' }}
        >
          {label}
        </motion.label>

        {/* Icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
          <Icon
            size={14}
            style={{ color: focused ? '#15803d' : valid && touched ? '#22c55e' : '#4d7c0f' }}
            className="transition-colors duration-200"
          />
        </div>

        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={focused ? placeholder : ''}
          className="w-full bg-transparent outline-none text-sm pt-5 pb-2 pl-10 pr-10 text-[#0f2d0f] placeholder:text-[#86a878] placeholder:text-xs"
          style={{ fontFamily: '"DM Mono", monospace' }}
          autoComplete={type === 'email' ? 'email' : 'name'}
        />

        {/* Valid check */}
        <AnimatePresence>
          {valid && touched && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-[#22c55e] flex items-center justify-center"
            >
              <Check size={10} className="text-white" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error indicator */}
        <AnimatePresence>
          {touched && !valid && (
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-red-400/20 flex items-center justify-center"
            >
              <span className="text-red-400 text-[10px] font-black">!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Timezone pill grid ───────────────────────────────────────────────────────
const REGIONS = ['Americas', 'Europe', 'Asia', 'Pacific', 'Africa']

function TimezonePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [region, setRegion] = useState(() => {
    const def = TIMEZONES.find(t => t.label === value)
    return def?.region ?? 'Americas'
  })

  const filtered = TIMEZONES.filter(t => t.region === region)

  return (
    <div className="space-y-3">
      {/* Region tabs */}
      <div className="flex gap-1 flex-wrap">
        {REGIONS.map(r => (
          <button
            key={r}
            type="button"
            data-hover
            onClick={() => setRegion(r)}
            className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-150"
            style={{
              background: region === r ? '#14532d' : 'rgba(187,247,208,0.3)',
              color: region === r ? '#fff' : '#3f6212',
              border: `1px solid ${region === r ? '#14532d' : 'rgba(187,247,208,0.6)'}`,
            }}
          >
            {r}
          </button>
        ))}
      </div>

      {/* TZ pills */}
      <motion.div
        key={region}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="grid grid-cols-3 gap-1.5"
      >
        {filtered.map(tz => {
          const selected = value === tz.label
          return (
            <motion.button
              key={tz.label}
              type="button"
              data-hover
              onClick={() => onChange(tz.label)}
              whileTap={{ scale: 0.94 }}
              title={`${tz.full} (${tz.offset})`}
              className="relative rounded-lg py-2 px-1 text-center transition-all duration-150 overflow-hidden"
              style={{
                background: selected ? '#14532d' : 'rgba(255,255,255,0.6)',
                border: `1.5px solid ${selected ? '#14532d' : 'rgba(187,247,208,0.7)'}`,
                boxShadow: selected ? '0 4px 14px rgba(20,83,45,0.25)' : 'none',
              }}
            >
              {selected && (
                <motion.div
                  layoutId="tz-selected"
                  className="absolute inset-0 bg-[#14532d] rounded-lg"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <div className="relative z-10">
                <div
                  className="text-xs font-black tracking-wide"
                  style={{ color: selected ? '#86efac' : '#14532d' }}
                >
                  {tz.label}
                </div>
                <div
                  className="text-[8px] mt-0.5 font-mono"
                  style={{ color: selected ? 'rgba(134,239,172,0.7)' : '#4d7c0f' }}
                >
                  {tz.offset}
                </div>
              </div>
            </motion.button>
          )
        })}
      </motion.div>

      {/* Selected timezone info bar */}
      <AnimatePresence mode="wait">
        {value && (() => {
          const sel = TIMEZONES.find(t => t.label === value)
          if (!sel) return null
          return (
            <motion.div
              key={value}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div
                className="flex items-center justify-between px-3 py-2 rounded-lg"
                style={{ background: 'rgba(187,247,208,0.2)', border: '1px solid rgba(187,247,208,0.5)' }}
              >
                <div className="flex items-center gap-2">
                  <Globe size={11} style={{ color: '#15803d' }} />
                  <span className="text-[11px] font-bold text-[#14532d]">{sel.full}</span>
                </div>
                <span className="text-[10px] font-mono text-[#3f6212]">{sel.offset}</span>
              </div>
            </motion.div>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === current ? 20 : 6,
            background: i < current ? '#22c55e' : i === current ? '#14532d' : 'rgba(187,247,208,0.5)',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="h-1.5 rounded-full"
        />
      ))}
    </div>
  )
}

// ─── Tilt card wrapper ────────────────────────────────────────────────────────
function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const rotX = useMotionValue(0)
  const rotY = useMotionValue(0)
  const sRotX = useSpring(rotX, { stiffness: 200, damping: 30 })
  const sRotY = useSpring(rotY, { stiffness: 200, damping: 30 })
  const gX = useTransform(sRotY, [-8, 8], ['0%', '100%'])
  const gY = useTransform(sRotX, [8, -8], ['0%', '100%'])

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    rotX.set(y * -8)
    rotY.set(x * 8)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => { rotX.set(0); rotY.set(0) }}
      style={{ rotateX: sRotX, rotateY: sRotY, transformStyle: 'preserve-3d', perspective: 800 }}
      className="relative"
    >
      {/* Specular sheen */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 z-20"
        style={{
          background: `radial-gradient(circle at ${gX} ${gY}, rgba(255,255,255,0.12) 0%, transparent 60%)`,
        }}
      />
      {children}
    </motion.div>
  )
}

// ─── Success fireworks ────────────────────────────────────────────────────────
function Confetti() {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 300,
    y: (Math.random() - 0.5) * 300,
    color: ['#14532d','#22c55e','#86efac','#bbf7d0','#0d9488'][i % 5],
    rotate: Math.random() * 720,
    scale: 0.5 + Math.random() * 0.8,
    delay: Math.random() * 0.3,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2 w-2 h-2 rounded-sm"
          style={{ backgroundColor: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: p.scale, rotate: p.rotate }}
          transition={{ duration: 1.2, delay: p.delay, ease: [0.2, 0, 0.8, 1] }}
        />
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function SignupCard() {
  const [step, setStep] = useState(0) // 0=name, 1=email, 2=timezone, 3=confirm
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [tz, setTz] = useState(getDefaultTz)
  const [touchedName, setTouchedName] = useState(false)
  const [touchedEmail, setTouchedEmail] = useState(false)
  const [submitState, setSubmitState] = useState<'idle'|'loading'|'success'|'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const nameOk = name.trim().length >= 2
  const emailOk = isValidEmail(email)
  const tzOk = tz.length > 0

  const STEPS = ['Name', 'Email', 'Timezone', 'Launch']

  const canAdvance = [nameOk, emailOk, tzOk, nameOk && emailOk && tzOk][step]

  const advance = () => {
    if (step === 0) setTouchedName(true)
    if (step === 1) setTouchedEmail(true)
    if (canAdvance && step < 3) setStep(s => s + 1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); advance() }
  }

  async function submit() {
    setSubmitState('loading')

    if (!supabase) {
      setErrorMsg('Supabase not configured — add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
      setSubmitState('error')
      return
    }

    // ── Duplicate email check ──────────────────────────────────────────────
    const { data: existing, error: checkError } = await supabase
      .from('event_signups')
      .select('email')
      .eq('email', email.trim().toLowerCase())
      .limit(1)

    if (checkError) {
      setErrorMsg(checkError.message)
      setSubmitState('error')
      return
    }

    if (existing && existing.length > 0) {
      setErrorMsg('This email is already registered. See you at FutureForge!')
      setSubmitState('error')
      return
    }
    // ──────────────────────────────────────────────────────────────────────

    const sel = TIMEZONES.find(t => t.label === tz)

    const { error } = await supabase.from('event_signups').insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      timezone: sel?.iana ?? tz,
      event: 'Future Forge',
      source: 'landing',
    })

    if (error) {
      setErrorMsg(error.message)
      setSubmitState('error')
    } else {
      setSubmitState('success')
    }
  }

  if (submitState === 'success') {
    return (
      <TiltCard>
        <div
          className="relative rounded-2xl p-8 overflow-hidden text-center"
          style={{
            background: '#fff',
            border: '1.5px solid rgba(187,247,208,0.8)',
            boxShadow: '0 20px 60px rgba(22,163,74,0.15)',
          }}
        >
          <Confetti />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
            className="mx-auto mb-5 h-16 w-16 rounded-full bg-[#14532d] flex items-center justify-center"
          >
            <Check size={28} className="text-white" strokeWidth={3} />
          </motion.div>
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-black tracking-tight text-[#0f2d0f]"
            style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}
          >
            You're In.
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="mt-2 text-sm text-[#3f6212]"
            style={{ fontFamily: '"DM Mono", monospace' }}
          >
            Welcome, {name.split(' ')[0]}. We'll be in touch.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2"
            style={{ background: 'rgba(187,247,208,0.3)', border: '1px solid rgba(187,247,208,0.6)' }}
          >
            <span className="text-xs font-mono text-[#15803d]">{email}</span>
            <span className="text-[10px] font-mono text-[#3f6212]">· {tz}</span>
          </motion.div>
        </div>
      </TiltCard>
    )
  }

  return (
    <TiltCard>
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: '#fff',
          border: '1.5px solid rgba(187,247,208,0.7)',
          boxShadow: '0 20px 60px rgba(22,163,74,0.1), 0 1px 0 rgba(255,255,255,0.9) inset',
        }}
      >
        {/* Progress bar */}
        <div className="h-0.5 bg-[#f0fdf4]">
          <motion.div
            className="h-full bg-[#14532d]"
            animate={{ width: `${((step) / (STEPS.length - 1)) * 100}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 30 }}
          />
        </div>

        <div className="p-6 md:p-7">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2
                className="text-xl font-black tracking-tight text-[#0f2d0f]"
                style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}
              >
                Join the Mission
              </h2>
            </div>
            <StepDots current={step} total={STEPS.length} />
          </div>

          {/* Step label */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`label-${step}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
              className="mb-4"
            >
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#3f6212]">
                Step {step + 1} of {STEPS.length}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Form steps */}
          <div onKeyDown={handleKeyDown}>
            <AnimatePresence mode="wait">

              {/* STEP 0 — Name */}
              {step === 0 && (
                <motion.div
                  key="step-name"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  className="space-y-4"
                >
                  <Field
                    icon={User}
                    label="Your Name"
                    value={name}
                    onChange={v => { setName(v); if (!touchedName && v.length > 0) setTouchedName(true) }}
                    placeholder="e.g. Faiz Khan"
                    valid={nameOk}
                    touched={touchedName}
                  />
                  {touchedName && !nameOk && (
                    <p className="text-[11px] text-red-400" style={{ fontFamily: '"DM Mono", monospace' }}>
                      Name must be at least 2 characters.
                    </p>
                  )}
                </motion.div>
              )}

              {/* STEP 1 — Email */}
              {step === 1 && (
                <motion.div
                  key="step-email"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  className="space-y-4"
                >
                  <Field
                    icon={Mail}
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={v => { setEmail(v); if (!touchedEmail && v.length > 0) setTouchedEmail(true) }}
                    placeholder="you@domain.com"
                    valid={emailOk}
                    touched={touchedEmail}
                  />
                  {touchedEmail && !emailOk && (
                    <p className="text-[11px] text-red-400" style={{ fontFamily: '"DM Mono", monospace' }}>
                      Please enter a valid email.
                    </p>
                  )}
                </motion.div>
              )}

              {/* STEP 2 — Timezone */}
              {step === 2 && (
                <motion.div
                  key="step-tz"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                >
                  <TimezonePicker value={tz} onChange={setTz} />
                </motion.div>
              )}

              {/* STEP 3 — Confirm */}
              {step === 3 && (
                <motion.div
                  key="step-confirm"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  className="space-y-2"
                >
                  {[
                    { label: 'Name', value: name, icon: User },
                    { label: 'Email', value: email, icon: Mail },
                    { label: 'Timezone', value: tz + ' — ' + (TIMEZONES.find(t => t.label === tz)?.offset ?? ''), icon: Globe },
                  ].map((row, i) => (
                    <motion.div
                      key={row.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-3 rounded-xl px-4 py-3"
                      style={{ background: 'rgba(240,253,244,0.7)', border: '1px solid rgba(187,247,208,0.5)' }}
                    >
                      <row.icon size={13} style={{ color: '#15803d' }} className="shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#4d7c0f]">{row.label}</div>
                        <div className="text-sm font-mono text-[#14532d] truncate">{row.value}</div>
                      </div>
                      <button
                        type="button"
                        data-hover
                        onClick={() => setStep(i)}
                        className="text-[9px] font-black tracking-widest uppercase text-[#3f6212] hover:text-[#14532d] transition-colors"
                      >
                        Edit
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Error state */}
          <AnimatePresence>
            {submitState === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-4 flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm"
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#b91c1c' }}
              >
                <TriangleAlert size={14} className="mt-0.5 shrink-0" />
                <span className="text-xs font-mono">{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-5 flex gap-3 items-center">
            {step > 0 && (
              <button
                type="button"
                data-hover
                onClick={() => setStep(s => s - 1)}
                className="px-4 py-2.5 rounded-xl text-[11px] font-black tracking-widest uppercase transition-colors"
                style={{ border: '1.5px solid rgba(187,247,208,0.7)', color: '#3f6212', background: 'transparent' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(187,247,208,0.3)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                ← Back
              </button>
            )}

            {step < 3 ? (
              <motion.button
                type="button"
                data-hover
                data-cursor-label={['Name', 'Email', 'Timezone', 'Launch'][step + 1] ?? '→'}
                onClick={advance}
                disabled={!canAdvance}
                whileTap={canAdvance ? { scale: 0.96 } : undefined}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-black tracking-widest uppercase transition-all"
                style={{
                  background: canAdvance ? '#14532d' : 'rgba(187,247,208,0.3)',
                  color: canAdvance ? '#fff' : 'rgba(134,239,172,0.6)',
                  boxShadow: canAdvance ? '0 8px 28px rgba(20,83,45,0.28)' : 'none',
                }}
                animate={canAdvance ? { opacity: 1 } : { opacity: 0.6 }}
              >
                {STEPS[step + 1]}
                <ArrowRight size={13} />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                data-hover
                data-cursor-label="Launch"
                onClick={submit}
                disabled={submitState === 'loading'}
                whileTap={{ scale: 0.96 }}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-black tracking-widest uppercase relative overflow-hidden"
                style={{
                  background: '#14532d',
                  color: '#fff',
                  boxShadow: '0 8px 28px rgba(20,83,45,0.32)',
                }}
              >
                {/* Shimmer sweep on confirm */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(134,239,172,0.2), transparent)', width: '40%' }}
                />
                {submitState === 'loading' ? (
                  <><Loader2 size={14} className="animate-spin" /> Launching…</>
                ) : (
                  <><span>Launch Registration</span> <ArrowRight size={13} /></>
                )}
              </motion.button>
            )}
          </div>

          {/* Footer note */}
          <p
            className="mt-4 text-center text-[10px] text-[#4d7c0f]"
            style={{ fontFamily: '"DM Mono", monospace' }}
          >
            FutureForge 2026
          </p>
        </div>
      </div>
    </TiltCard>
  )
}