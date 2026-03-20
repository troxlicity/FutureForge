import {
  AnimatePresence,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
} from 'framer-motion'
import { useEffect, useRef, useState, useCallback } from 'react'
import { SignupCard } from './components/SignupCard'
import { CollabSection } from './components/CollabSection'
import { IntroOverlay } from './components/IntroOverlay'
import { BackgroundFX } from './components/BackgroundFX'

// ─── Inject global cursor:none so native cursor never reappears ───────────────
const CURSOR_STYLE = `
  *, *::before, *::after,
  a, button, input, textarea, select, label,
  [role="button"], [role="link"], [tabindex],
  input[type="text"], input[type="email"], input[type="search"],
  input[type="submit"], input[type="reset"] {
    cursor: none !important;
  }
`

// ─── Custom Cursor ────────────────────────────────────────────────────────────
function Cursor() {
  const cursorX = useMotionValue(-200)
  const cursorY = useMotionValue(-200)
  const trailX = useMotionValue(-200)
  const trailY = useMotionValue(-200)
  const [hovered, setHovered] = useState(false)
  const [clicking, setClicking] = useState(false)
  const [label, setLabel] = useState('')

  const dotX = useSpring(cursorX, { stiffness: 800, damping: 50 })
  const dotY = useSpring(cursorY, { stiffness: 800, damping: 50 })
  const ringX = useSpring(trailX, { stiffness: 140, damping: 32 })
  const ringY = useSpring(trailY, { stiffness: 140, damping: 32 })

  useEffect(() => {
    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      trailX.set(e.clientX)
      trailY.set(e.clientY)
    }
    const over = (e: MouseEvent) => {
      const t = e.target as Element
      const interactive = t.closest('a,button,[data-hover],input,label,select,textarea,[role="button"]') as HTMLElement | null
      if (interactive) {
        setHovered(true)
        setLabel(interactive.dataset?.cursorLabel ?? '')
      }
    }
    const out = (e: MouseEvent) => {
      const t = e.target as Element
      if (t.closest('a,button,[data-hover],input,label,select,textarea,[role="button"]')) {
        setHovered(false)
        setLabel('')
      }
    }
    const down = () => setClicking(true)
    const up = () => setClicking(false)

    window.addEventListener('mousemove', move)
    window.addEventListener('mouseover', over)
    window.addEventListener('mouseout', out)
    window.addEventListener('mousedown', down)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', over)
      window.removeEventListener('mouseout', out)
      window.removeEventListener('mousedown', down)
      window.removeEventListener('mouseup', up)
    }
  }, [cursorX, cursorY, trailX, trailY])

  return (
    <>
      <style>{CURSOR_STYLE}</style>
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          mixBlendMode: 'multiply',
        }}
        animate={{
          width: clicking ? 20 : hovered ? 52 : 32,
          height: clicking ? 20 : hovered ? 52 : 32,
          backgroundColor: hovered ? '#14532d' : 'transparent',
          borderColor: hovered ? '#14532d' : '#15803d',
          borderWidth: hovered ? 0 : 1.5,
          borderStyle: 'solid',
          opacity: clicking ? 0.6 : hovered ? 0.15 : 0.5,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      />
      <AnimatePresence>
        {hovered && label && (
          <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[9999]"
            style={{ x: ringX, y: ringY, translateX: '-50%', translateY: 'calc(-50% + 36px)' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <span className="text-[9px] font-black tracking-widest uppercase text-[#14532d] bg-white/80 px-2 py-0.5 rounded-full border border-[#bbf7d0] whitespace-nowrap backdrop-blur-sm">
              {label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full bg-[#15803d]"
        style={{
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: clicking ? 3 : hovered ? 5 : 6,
          height: clicking ? 3 : hovered ? 5 : 6,
          opacity: hovered ? 0 : 1,
        }}
        transition={{ type: 'spring', stiffness: 600, damping: 40 }}
      />
    </>
  )
}

// ─── Text Scramble ────────────────────────────────────────────────────────────
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#@!?'

function useScramble(target: string, trigger: boolean = true, delay: number = 0): string {
  const [display, setDisplay] = useState(target)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!trigger) return
    let iteration = 0
    const total = target.length * 2.8
    const timeout = setTimeout(() => {
      const run = () => {
        setDisplay(
          target
            .split('')
            .map((char, i) => {
              if (char === ' ') return ' '
              if (i < iteration / 2.8) return char
              return CHARS[Math.floor(Math.random() * CHARS.length)]
            })
            .join('')
        )
        iteration++
        if (iteration < total + target.length) {
          rafRef.current = requestAnimationFrame(run)
        } else {
          setDisplay(target)
        }
      }
      rafRef.current = requestAnimationFrame(run)
    }, delay)
    return () => {
      clearTimeout(timeout)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, trigger, delay])

  return display
}

// ─── Magnetic Button ──────────────────────────────────────────────────────────
interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  href?: string
  'data-cursor-label'?: string
}

function MagneticButton({ children, className, style, onClick, href, ...rest }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement & HTMLAnchorElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 280, damping: 22 })
  const sy = useSpring(y, { stiffness: 280, damping: 22 })

  const handleMouse = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.38)
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.38)
  }, [x, y])

  const Tag = href ? motion.a : motion.button

  return (
    <Tag
      ref={ref as any}
      href={href}
      onClick={onClick}
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      style={{ x: sx, y: sy, ...style }}
      className={className}
      data-hover
      {...rest}
    >
      {children}
    </Tag>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [introDone, setIntroDone] = useState(false)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  const line1 = useScramble('FORGING THE', introDone, 80)
  const line2 = useScramble('GREEN FUTURE', introDone, 380)

  useEffect(() => {
    const t = setTimeout(() => setIntroDone(true), 3400)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    document.body.style.cursor = 'none'
    return () => { document.body.style.cursor = '' }
  }, [])

  return (
    <div className="relative min-h-dvh bg-[#f4f9f4]" style={{ cursor: 'none' }}>

      {/* Scroll bar */}
      <motion.div
        style={{ scaleX }}
        className="fixed left-0 top-0 right-0 z-[200] h-[2px] origin-left bg-[#14532d]"
      />

      <Cursor />

      <AnimatePresence>
        {!introDone && <IntroOverlay key="intro" />}
      </AnimatePresence>

      {/* Grid texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(187,247,208,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(187,247,208,0.18) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <BackgroundFX />

      <main className="relative z-10">

        {/* ── HERO ── */}
        <section id="mission" className="px-6 md:px-12 pt-16 md:pt-24 pb-4">
          <div className="mx-auto max-w-7xl grid md:grid-cols-[1fr_400px] gap-10 lg:gap-20 items-start">

            {/* Left */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={introDone ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-7 inline-block border border-[#bbf7d0] px-3 py-1.5"
              >
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#15803d]">
                  11 – 18 April 2026
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0 }}
                animate={introDone ? { opacity: 1 } : {}}
                transition={{ duration: 0.3 }}
                className="leading-[0.9] tracking-tighter text-[#0f2d0f] font-black"
                style={{ fontSize: 'clamp(3.8rem, 10vw, 8.5rem)', fontFamily: '"Bricolage Grotesque", sans-serif' }}
              >
                {line1}
                <br />
                <span className="text-[#15803d]">{line2}</span>
              </motion.h1>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={introDone ? { scaleX: 1 } : {}}
                transition={{ duration: 0.7, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="my-8 h-px bg-[#bbf7d0] origin-left max-w-lg"
              />

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={introDone ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.75 }}
                className="max-w-sm text-[0.875rem] leading-[1.7] text-[#3f6212]"
                style={{ fontFamily: '"DM Mono", monospace' }}
              >
                1 week. 1 project that uses tech to help the environment. And some awesome judeges & prizes.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={introDone ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="mt-9 flex flex-wrap gap-4"
              >
                <MagneticButton
                  className="px-7 py-3.5 border border-[#14532d] text-[#14532d] text-[11px] font-black tracking-[0.2em] uppercase hover:bg-[#14532d] hover:text-white transition-colors"
                  onClick={() => document.getElementById('partners')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  View Partners
                </MagneticButton>
              </motion.div>
            </div>

            {/* Right — signup */}
            <motion.div
              id="register"
              initial={{ opacity: 0, y: 24 }}
              animate={introDone ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="md:mt-16 md:sticky md:top-8"
            >
              <SignupCard />
            </motion.div>
          </div>
        </section>

        {/* ── PARTNERS ── */}
        <div id="partners" className="px-6 md:px-12">
          <CollabSection />
        </div>

        {/* ── FOOTER ── */}
        <footer className="border-t border-[#d1fae5] px-6 md:px-12 py-10 mt-20">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 opacity-35">
              <img src="/lockin.png" alt="" className="h-5" />
              <span className="text-[#bbf7d0]">×</span>
              <img src="/projectgenplanet.png" alt="" className="h-5" />
            </div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#86efac]">
              © {new Date().getFullYear()} Future Forge · Built for the Planet
            </p>
            <p
              className="text-[10px] tracking-[0.2em] uppercase text-[#3f6212]"
              style={{ fontFamily: '"DM Mono", monospace' }}
            >
              72h · Climate Tech · 2026
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}