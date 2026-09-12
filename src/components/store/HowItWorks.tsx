import { motion } from 'framer-motion'
import { Gift, PenLine, WandSparkles } from 'lucide-react'

const STEPS = [
  {
    icon: WandSparkles,
    step: '01',
    title: 'Choose an Experience',
    body: 'Select from our crafted animated themes — each one a miniature story, ready to feel.',
    tint: {
      card: 'border-rose-100 bg-gradient-to-b from-white to-rose-50/70',
      glow: 'bg-rose-200/40',
      badge: 'from-rose-400 to-pink-500',
      shadow: 'shadow-rose-200',
      stepChip: 'from-rose-500 to-pink-400',
    },
  },
  {
    icon: PenLine,
    step: '02',
    title: 'Personalize with Love',
    body: 'Add their name, your photos, a heartfelt note, and a song that says what words cannot.',
    tint: {
      card: 'border-orange-100 bg-gradient-to-b from-white to-orange-50/70',
      glow: 'bg-orange-200/40',
      badge: 'from-orange-300 to-rose-300',
      shadow: 'shadow-orange-100',
      stepChip: 'from-orange-400 to-rose-400',
    },
  },
  {
    icon: Gift,
    step: '03',
    title: 'Send the Magic Link',
    body: 'One tap opens the surprise on any phone or browser. They open it whenever they are ready.',
    tint: {
      card: 'border-purple-100 bg-gradient-to-b from-white to-purple-50/70',
      glow: 'bg-purple-200/40',
      badge: 'from-purple-400 to-pink-400',
      shadow: 'shadow-purple-100',
      stepChip: 'from-purple-500 to-pink-400',
    },
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
          <p className="mb-3 text-sm font-semibold tracking-[0.25em] text-rose-500 uppercase">
            How Cupi works
          </p>
          <h2 className="font-display text-4xl font-bold text-stone-900 sm:text-5xl">
            From heartfelt to{' '}
            <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 bg-clip-text text-transparent">
              jaw-dropping
            </span>{' '}
            in three steps.
          </h2>
        </motion.div>

        <div className="relative grid gap-8 md:grid-cols-3">
          <div
            aria-hidden
            className="absolute inset-x-16 top-14 hidden h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent md:block"
          />
          {STEPS.map(({ icon: Icon, step, title, body, tint }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.14, ease: 'easeOut' }}
              className={`group relative flex flex-col items-center gap-4 overflow-hidden rounded-3xl border p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(244,63,94,0.1)] ${tint.card}`}
            >
              <div
                aria-hidden
                className={`pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl ${tint.glow}`}
              />
              <div className="relative">
                <span className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${tint.badge} shadow-lg ${tint.shadow} transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105`}>
                  <Icon className="h-7 w-7 text-white" strokeWidth={1.8} />
                </span>
                <span className={`absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${tint.stepChip} text-[11px] font-black text-white shadow-md`}>
                  {step}
                </span>
              </div>
              <h3 className="font-display text-lg font-semibold text-stone-900">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-stone-500">{body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}