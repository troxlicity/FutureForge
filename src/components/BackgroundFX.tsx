import { motion } from 'framer-motion'

function rand(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// Organic leaf/petal SVG shapes
function LeafParticle({ i }: { i: number }) {
  const r1 = rand(i + 1)
  const r2 = rand(i + 50)
  const r3 = rand(i + 100)
  const size = 6 + r3 * 16

  return (
    <motion.div
      key={`leaf-${i}`}
      className="absolute"
      style={{
        left: `${r1 * 100}%`,
        top: `${(r2 * 120) - 10}%`,
        width: size,
        height: size,
      }}
      animate={{
        y: [0, -window.innerHeight * 0.4 - 100],
        x: [0, (r3 - 0.5) * 120],
        rotate: [0, 360 * (r1 > 0.5 ? 1 : -1)],
        opacity: [0, 0.6, 0.4, 0],
      }}
      transition={{
        duration: 10 + r1 * 12,
        repeat: Infinity,
        delay: r2 * 15,
        ease: 'linear',
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" style={{ width: '100%', height: '100%' }}>
        <path
          d="M12 2C6.5 2 2 12 2 12C2 12 6.5 22 12 22C14 18 16 14 16 12C16 8 14 4 12 2Z"
          fill={`rgba(${i % 2 === 0 ? '22,163,74' : '20,184,166'},${0.2 + r3 * 0.3})`}
        />
      </svg>
    </motion.div>
  )
}

export function BackgroundFX() {
  return (
    <>
      {/* Soft ambient blobs — organic, meadow-like */}
      <motion.div
        className="pointer-events-none fixed -left-60 -top-40 h-[700px] w-[700px] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(134,239,172,0.35) 0%, rgba(187,247,208,0.15) 60%, transparent 80%)' }}
        animate={{ x: [0, 40, -20, 0], y: [0, 30, -20, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none fixed -right-60 top-1/3 h-[600px] w-[600px] rounded-full blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgba(167,243,208,0.3) 0%, rgba(204,251,241,0.15) 60%, transparent 80%)' }}
        animate={{ x: [0, -30, 20, 0], y: [0, -40, 20, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none fixed left-1/3 bottom-0 h-[400px] w-[500px] rounded-full blur-[80px]"
        style={{ background: 'radial-gradient(circle, rgba(217,249,157,0.3) 0%, transparent 70%)' }}
        animate={{ x: [0, 20, -20, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating leaf / petal particles */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {Array.from({ length: 18 }).map((_, i) => (
          <LeafParticle key={i} i={i} />
        ))}
      </div>

      {/* Organic grid overlay — leaf veins */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(22,163,74,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(22,163,74,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at 50% 30%, black 0%, transparent 75%)',
        }}
      />

      {/* Vertical light shafts — dappled sunlight through leaves */}
      {[10, 35, 60, 82].map((left, i) => (
        <motion.div
          key={`shaft-${i}`}
          className="pointer-events-none fixed top-0 h-full"
          style={{
            left: `${left}%`,
            width: `${2 + i}px`,
            background: `linear-gradient(to bottom, rgba(134,239,172,0.15), rgba(52,211,153,0.08) 40%, transparent)`,
          }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scaleY: [0.9, 1.05, 0.9],
          }}
          transition={{
            duration: 5 + i * 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.7,
          }}
        />
      ))}

      {/* Dew drops / bioluminescent dots */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {Array.from({ length: 25 }).map((_, i) => {
          const r1 = rand(i + 200)
          const r2 = rand(i + 300)
          const r3 = rand(i + 400)
          return (
            <motion.div
              key={`dew-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${r1 * 100}%`,
                top: `${r2 * 100}%`,
                width: 3 + r3 * 5,
                height: 3 + r3 * 5,
                background: `radial-gradient(circle, rgba(${i % 3 === 0 ? '52,211,153' : i % 3 === 1 ? '132,204,22' : '20,184,166'},0.6) 0%, transparent 70%)`,
                boxShadow: `0 0 ${6 + r3 * 10}px rgba(52,211,153,0.4)`,
              }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 3 + r1 * 5,
                repeat: Infinity,
                delay: r2 * 8,
                ease: 'easeInOut',
              }}
            />
          )
        })}
      </div>
    </>
  )
}