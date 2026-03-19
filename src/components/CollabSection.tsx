import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

function CollabCard({ title, subtitle, imgSrc, accent, tag }: {
  title: string
  subtitle: string
  imgSrc: string
  accent: string
  tag: string
}) {
  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative overflow-hidden rounded-3xl p-8"
      style={{
        background: 'rgba(255,255,255,0.65)',
        border: `1px solid ${accent}30`,
        backdropFilter: 'blur(20px)',
        boxShadow: `0 8px 40px ${accent}15, 0 1px 0 rgba(255,255,255,0.8) inset`,
      }}
    >
      {/* Hover shimmer */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${accent}15 0%, transparent 60%)`,
        }}
      />

      {/* Decorative corner leaf */}
      <div
        className="absolute top-4 right-4 text-2xl opacity-20 group-hover:opacity-50 transition-opacity duration-300"
        style={{ transform: 'rotate(30deg)' }}
      >
        🍃
      </div>

      <div className="relative z-10 flex flex-col items-center text-center gap-5">
        <motion.div
          className="flex h-20 w-20 items-center justify-center rounded-2xl p-4"
          style={{
            background: `linear-gradient(135deg, ${accent}15, ${accent}08)`,
            border: `1px solid ${accent}25`,
          }}
          whileHover={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.5 }}
        >
          <img src={imgSrc} alt={title} className="h-full w-full object-contain" />
        </motion.div>

        <div>
          <h3
            className="text-xl font-black tracking-tight"
            style={{ color: '#14532d' }}
          >
            {title}
          </h3>
          <p className="text-sm mt-1" style={{ color: '#4d7c0f' }}>{subtitle}</p>
        </div>

        {/* Single unique tag */}
        <div className="flex justify-center">
          <span
            className="text-xs px-3 py-1 rounded-full"
            style={{
              background: `${accent}12`,
              color: accent,
              border: `1px solid ${accent}25`,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontSize: '0.65rem',
            }}
          >
            {tag}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// Animated connecting element
function ForgeConnector() {
  return (
    <div className="relative flex h-16 w-16 items-center justify-center mx-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full border border-dashed"
        style={{ borderColor: 'rgba(22,163,74,0.3)' }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-2 rounded-full"
        style={{ border: '1px solid rgba(20,184,166,0.2)' }}
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="relative text-xl"
      >
        🌿
      </motion.div>
    </div>
  )
}

export function CollabSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="relative py-24">
      {/* Section heading */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="text-center mb-16"
        style={{ overflow: 'visible' }}
      >
        <div
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 px-4 py-2 rounded-full"
          style={{
            background: 'rgba(22,163,74,0.08)',
            color: '#16a34a',
            border: '1px solid rgba(22,163,74,0.2)',
          }}
        >
           The Partnership
        </div>
        <h2
          className="text-4xl md:text-5xl font-black tracking-tighter pb-2"
          style={{
            color: '#14532d',
            lineHeight: 1.1,
          }}
        >
          Stronger Together
        </h2>
        <p className="mt-4 max-w-lg mx-auto text-base" style={{ color: '#3f6212' }}>
          Two organizations united by a single mission: accelerating the green transition with technology.
        </p>
      </motion.div>

      {/* Cards */}
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]"
        >
          <CollabCard
            title="LockIn"
            subtitle="Strategic Logistics & Scale"
            imgSrc="/lockin.png"
            accent="#16a34a"
            tag="Startup"
          />

          <ForgeConnector />

          <CollabCard
            title="Project GenPlanet"
            subtitle="Environmental Impact & Research"
            imgSrc="/projectgenplanet.png"
            accent="#0d9488"
            tag="Nonprofit"
          />
        </motion.div>
      </div>
    </section>
  )
}