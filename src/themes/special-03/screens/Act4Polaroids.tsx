import { motion } from 'framer-motion'
import { useMemo } from 'react'
import type { ExperienceConfig } from '../../../types/experience'
import { ScreenShell } from '../../shared/ScreenShell'
import { PolaroidSwipeStack } from '../components/PolaroidSwipeStack'

interface Act4PolaroidsProps {
  config: ExperienceConfig
  onContinue: () => void
}

export function Act4Polaroids({ config, onContinue }: Act4PolaroidsProps) {
  const photos = useMemo(() => {
    const pool = config.content.photos
    if (pool.length === 0) return []
    if (pool.length >= 3) return pool
    return Array.from({ length: 3 }, (_, i) => pool[i % pool.length])
  }, [config.content.photos])

  return (
    <ScreenShell className="bg-[#FCF1ED] py-24">
      {photos.length > 0 ? (
        <PolaroidSwipeStack photos={photos} onDone={onContinue} />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <p className="text-stone-600">Memories loading…</p>
          <button
            type="button"
            onClick={onContinue}
            className="mt-4 rounded-full bg-rose-500 px-6 py-2 text-sm font-bold text-white"
          >
            Continue
          </button>
        </motion.div>
      )}
    </ScreenShell>
  )
}
