import { motion } from 'framer-motion'
import { Gift, PenLine, WandSparkles } from 'lucide-react'

const STEPS = [
  {
    icon: WandSparkles,
    step: '01',
    title: 'Choose an Experience',
    body: 'Select from our crafted animated themes — each one a miniature story, ready to feel.',
  },
  {
    icon: PenLine,
    step: '02',
    title: 'Personalize with Love',
    body: 'Add their name, your photos, a heartfelt note, and a song that says what words cannot.',
  },
  {
    icon: Gift,
    step: '03',
    title: 'Send the Magic Link',
    body: 'One tap opens the surprise on any phone or browser. They open it whenever they are ready.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative scroll-mt-24 px-5 py-24 sm:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/3 h-80 w-80 rounded-full opacity-25 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(252,217,166,0.45), transparent 70%)',
        }}
      />
      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-14 text-center"
        >
          <p className="mb-3 text-sm font-semibold tracking-[0.25em] text-rose-gold uppercase">
            How Cupi works
          </p>
          <h2 className="font-display text-4xl font-semibold text-white sm:text-5xl">
            From heartfelt to{' '}
            <span className="text-shimmer animate-shimmer">
              jaw-dropping
            </span>{' '}
            in three steps.
          </h2>
        </motion.div>

        <div className="relative grid gap-8 md:grid-cols-3">
          <div
            aria-hidden
            className="absolute inset-x-16 top-14 hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent md:block"
          />
          {STEPS.map(({ icon: Icon, step, title, body }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.14, ease: 'easeOut' }}
              className="glass-panel group relative flex flex-col items-center gap-4 rounded-3xl p-8 text-center"
            >
              <div className="relative">
                <span className="glow-violet flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-gold/20 to-soft-violet/20 ring-1 ring-white/10 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
                  <Icon className="h-7 w-7 text-rose-gold" strokeWidth={1.8} />
                </span>
                <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-rose-gold to-soft-violet text-[11px] font-black text-obsidian-900 shadow-lg">
                  {step}
                </span>
              </div>
              <h3 className="font-display text-lg font-semibold text-white">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-white/55">{body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}