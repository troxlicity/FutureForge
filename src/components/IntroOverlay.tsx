import { motion } from 'framer-motion'

function GrowingRing({ delay, scale }: { delay: number; scale: number[] }) {
  return (
    <motion.div
      className="absolute inset-0 rounded-full"
      style={{ border: '1px solid rgba(22,163,74,0.25)' }}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale, opacity: [0, 0.5, 0] }}
      transition={{ duration: 2.5, delay, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
    />
  )
}

// Animated growing vine/sprout
function VineSegment({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <motion.div
      className="absolute"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        width: 2,
        height: 40,
        background: 'linear-gradient(to bottom, rgba(22,163,74,0.6), transparent)',
        transformOrigin: 'top center',
        borderRadius: 2,
      }}
      initial={{ scaleY: 0, opacity: 0 }}
      animate={{ scaleY: 1, opacity: [0, 0.8, 0.6] }}
      transition={{ delay, duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
    />
  )
}

export function IntroOverlay() {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%)' }}
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 m-auto"
          style={{
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(134,239,172,0.4) 0%, rgba(167,243,208,0.2) 50%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Leaf vein grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(22,163,74,0.06) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(22,163,74,0.06) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at center, black, transparent 75%)',
          }}
        />
      </div>

      <div className="relative flex flex-col items-center">
        {/* Globe / core orb */}
        <div className="relative h-52 w-52">
          {/* Orbiting rings */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-[-18px] rounded-full border border-dashed"
            style={{ borderColor: 'rgba(22,163,74,0.3)' }}
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-[-34px] rounded-full"
            style={{ border: '1px solid rgba(20,184,166,0.15)' }}
          />
          {/* Slow outer orbit with leaf dot */}
          <motion.div
            className="absolute"
            style={{ inset: '-50px' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full"
              style={{ background: 'rgba(22,163,74,0.6)', boxShadow: '0 0 12px rgba(22,163,74,0.5)' }}
            />
          </motion.div>

          {/* Core sphere */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="relative h-full w-full rounded-full overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(240,253,244,0.9) 0%, rgba(220,252,231,0.7) 50%, rgba(204,251,241,0.6) 100%)',
              boxShadow: '0 0 80px rgba(22,163,74,0.2), 0 0 30px rgba(22,163,74,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
              border: '1px solid rgba(22,163,74,0.25)',
            }}
          >
            {/* Logo */}
            <div className="absolute inset-0 flex items-center justify-center p-10">
              <motion.img
                src="/logo.png"
                alt="GenPlanet"
                className="h-full w-full object-contain"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ filter: 'sepia(0.2) saturate(1.5) hue-rotate(60deg)' }}
              />
            </div>

            {/* Radar sweep — now a gentle shimmer */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              style={{
                background: 'conic-gradient(from 0deg, transparent 70%, rgba(22,163,74,0.25) 100%)',
              }}
            />

            {/* Pulse rings */}
            <GrowingRing delay={0} scale={[0.8, 1.5]} />
            <GrowingRing delay={0.6} scale={[0.8, 1.9]} />
          </motion.div>
        </div>

        {/* Vine decorations growing from globe */}
        {[
          { delay: 0.8, x: -60, y: 30 },
          { delay: 1.0, x: 60, y: 30 },
          { delay: 1.2, x: -30, y: 70 },
          { delay: 1.4, x: 30, y: 70 },
        ].map((v, i) => (
          <VineSegment key={i} {...v} />
        ))}

        {/* Text sequence */}
        <motion.div
          className="mt-14 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div
            className="flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.5em]"
            style={{ color: '#16a34a' }}
          >
            <span className="h-[1px] w-8" style={{ background: 'rgba(22,163,74,0.4)' }} />
            Initializing Forge
            <span className="h-[1px] w-8" style={{ background: 'rgba(22,163,74,0.4)' }} />
          </div>

          <motion.h1
            className="mt-4 text-5xl font-black tracking-tighter md:text-6xl pb-1"
            style={{ color: '#14532d' }}
          >
            FutureForge
          </motion.h1>

          <p className="mt-4 max-w-xs text-sm leading-relaxed" style={{ color: '#3f6212' }}>
            LockIn <span style={{ color: '#15803d', fontWeight: 700 }}>×</span> Project GenPlanet
            <br />
            <span style={{ color: '#4d7c0f' }}>Building for a resilient biosphere.</span>
          </p>
        </motion.div>

        {/* Progress bar — styled like a growing plant stem */}
        <div
          className="mt-10 h-[3px] w-52 overflow-hidden rounded-full"
          style={{ background: 'rgba(22,163,74,0.12)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #16a34a, #34d399, #84cc16)', boxShadow: '0 0 10px rgba(22,163,74,0.4)' }}
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            transition={{ duration: 2.8, ease: [0.65, 0, 0.35, 1] }}
          />
        </div>

        {/* Status text */}
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="mt-4 font-mono text-[9px] uppercase tracking-widest"
          style={{ color: '#4d7c0f' }}
        >
          Compiling Habitat Solutions... 0x4F2A
        </motion.div>
      </div>
    </motion.div>
  )
}