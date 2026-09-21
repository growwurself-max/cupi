import { useCallback, useEffect, useRef, useState } from 'react'
import type { ExperienceAudio } from '../types/experience'

function scheduleNotes(
  ctx: AudioContext,
  master: GainNode,
  notes: number[] | undefined,
  volume: number,
) {
  const safeNotes = notes ?? [523.25, 659.25, 783.99, 1046.5]
  const now = ctx.currentTime
  safeNotes.forEach((freq, i) => {
    const start = now + i * 0.18
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq

    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.4)

    const shimmer = ctx.createGain()
    shimmer.gain.setValueAtTime(0.3, start)
    osc.connect(gain).connect(shimmer).connect(master)
    osc.start(start)
    osc.stop(start + 1.5)
  })
}

interface UseSoundEffectsOptions {
  audio: ExperienceAudio
  enabled: boolean
}

export function useSoundEffects({ audio, enabled }: UseSoundEffectsOptions) {
  const ctxRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const mutedRef = useRef(false)

  const ensureContext = useCallback(() => {
    if (!ctxRef.current) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      if (!Ctor) return null
      const ctx = new Ctor()
      const master = ctx.createGain()
      master.gain.value = audio.volume
      master.connect(ctx.destination)
      ctxRef.current = ctx
      masterRef.current = master
    }
    if (ctxRef.current.state === 'suspended') {
      void ctxRef.current.resume()
    }
    return ctxRef.current
  }, [audio.volume])

  const playRevealChime = useCallback(() => {
    const ctx = ensureContext()
    if (!ctx || !masterRef.current) return
    const notes = audio.revealChimeNotes ?? [523.25, 659.25, 783.99, 1046.5]
    scheduleNotes(ctx, masterRef.current, notes, audio.volume)
  }, [audio.revealChimeNotes, audio.volume, ensureContext])

  const playBlowSound = useCallback(() => {
    const ctx = ensureContext()
    const master = masterRef.current
    if (!ctx || !master) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(audio.candleBlowPitch * 3, now)
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.28)

    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(audio.volume * 0.6, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5)

    const noise = ctx.createBufferSource()
    const buffer = ctx.createBuffer(
      1,
      Math.floor(ctx.sampleRate * 0.35),
      ctx.sampleRate,
    )
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
    }
    noise.buffer = buffer
    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(audio.volume * 0.25, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32)

    osc.connect(gain).connect(master)
    noise.connect(noiseGain).connect(master)
    osc.start(now)
    noise.start(now)
    osc.stop(now + 0.5)
  }, [audio.candleBlowPitch, audio.volume, ensureContext])

  const playAmbientPad = useCallback(() => {
    const ctx = ensureContext()
    const master = masterRef.current
    if (!ctx || !master) return
    const now = ctx.currentTime
    const notes = [174.61, 220, 261.63, 329.63]
    notes.forEach((freq) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()
      osc.type = 'sine'
      osc.frequency.value = freq

      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(
        audio.volume * 0.06,
        now + 2.5,
      )
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 14)

      filter.type = 'lowpass'
      filter.frequency.value = 900
      osc.connect(filter).connect(gain).connect(master)
      osc.start(now)
      osc.stop(now + 14.5)
    })
  }, [audio.volume, ensureContext])

  const playBowTwang = useCallback(() => {
    const ctx = ensureContext()
    const master = masterRef.current
    if (!ctx || !master) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(540, now)
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.14)

    const shimmer = ctx.createOscillator()
    shimmer.type = 'sine'
    shimmer.frequency.setValueAtTime(1080, now)
    shimmer.frequency.exponentialRampToValueAtTime(320, now + 0.2)

    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(audio.volume * 0.5, now + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5)

    const shimmerGain = ctx.createGain()
    shimmerGain.gain.setValueAtTime(0.0001, now)
    shimmerGain.gain.exponentialRampToValueAtTime(audio.volume * 0.14, now + 0.02)
    shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42)

    osc.connect(gain).connect(master)
    shimmer.connect(shimmerGain).connect(master)
    osc.start(now)
    shimmer.start(now)
    osc.stop(now + 0.55)
    shimmer.stop(now + 0.45)
  }, [audio.volume, ensureContext])

  const playBurstShimmer = useCallback(() => {
    const ctx = ensureContext()
    const master = masterRef.current
    if (!ctx || !master) return
    const notes = [987.77, 1318.51, 1567.98, 2093.0]
    scheduleNotes(ctx, master, notes, audio.volume * 0.75)
  }, [audio.volume, ensureContext])

  const playSoftClick = useCallback(() => {
    const ctx = ensureContext()
    const master = masterRef.current
    if (!ctx || !master) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(880, now)
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.04)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(audio.volume * 0.22, now + 0.006)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07)
    osc.connect(gain).connect(master)
    osc.start(now)
    osc.stop(now + 0.08)
  }, [audio.volume, ensureContext])

  const playPop = useCallback(() => {
    const ctx = ensureContext()
    const master = masterRef.current
    if (!ctx || !master) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(420 + Math.random() * 80, now)
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.08)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(audio.volume * 0.45, now + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12)
    osc.connect(gain).connect(master)
    osc.start(now)
    osc.stop(now + 0.14)
  }, [audio.volume, ensureContext])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev
      mutedRef.current = next
      if (masterRef.current) {
        masterRef.current.gain.setTargetAtTime(
          next ? 0 : audio.volume,
          masterRef.current.context.currentTime,
          0.03,
        )
      }
      return next
    })
  }, [audio.volume])

  useEffect(() => {
    mutedRef.current = isMuted
    if (masterRef.current) {
      masterRef.current.gain.setTargetAtTime(
        isMuted ? 0 : audio.volume,
        masterRef.current.context.currentTime,
        0.03,
      )
    }
  }, [audio.volume, isMuted])

  useEffect(
    () => () => {
      void ctxRef.current?.close()
      ctxRef.current = null
      masterRef.current = null
    },
    [],
  )

  return {
    isMuted,
    isEnabled: enabled,
    toggleMute,
    playRevealChime,
    playBlowSound,
    playAmbientPad,
    playBowTwang,
    playBurstShimmer,
    playSoftClick,
    playPop,
    resume: ensureContext,
  }
}