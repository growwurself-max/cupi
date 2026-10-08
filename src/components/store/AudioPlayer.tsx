import { Volume2, VolumeX, Play, Pause } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface AudioPlayerProps {
  templateId?: string
}

interface AudioState {
  templateId: string | null
  status: 'loading' | 'ready' | 'error'
  src: string | null
}

const EMPTY: AudioState = { templateId: null, status: 'loading', src: null }

export function AudioPlayer({ templateId }: AudioPlayerProps) {
  const [state, setState] = useState<AudioState>(EMPTY)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [waitingForTap, setWaitingForTap] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  // One-shot guards so a later interaction never restarts music the buyer
  // deliberately paused, and gesture listeners are never attached twice.
  const gestureArmedRef = useRef(false)
  const retryHandledRef = useRef(false)

  useEffect(() => {
    if (!templateId) return

    let isMounted = true
    const controller = new AbortController()

    fetch(`${import.meta.env.VITE_API_URL || '/api'}/audio/${templateId}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error('No audio configured')
        return res.json()
      })
      .then((data: { audioData?: string; audioUrl?: string }) => {
        if (!isMounted) return
        const src = data.audioData || data.audioUrl || null
        setState({
          templateId,
          status: src ? 'ready' : 'error',
          src,
        })
      })
      .catch(() => {
        if (isMounted) setState({ templateId, status: 'error', src: null })
      })

    return () => {
      isMounted = false
      controller.abort()
      retryHandledRef.current = false
      gestureArmedRef.current = false
    }
  }, [templateId])

  const isCurrent = state.templateId === (templateId ?? null)
  const src = isCurrent ? state.src : null
  const isReady = isCurrent && state.status === 'ready' && src !== null

  useEffect(() => {
    const element = audioRef.current
    if (!isReady || !element) return

    const attemptStart = () => {
      element.play().then(
        () => {
          setIsPlaying(true)
          setWaitingForTap(false)
        },
        () => {
          // NotAllowedError: the browser only lets audio start inside a user
          // gesture. Keep the floating play button working and arm one-shot
          // listeners so the music begins on the very first real tap or keypress
          // instead of only when the button is clicked.
          setIsPlaying(false)
          setWaitingForTap(true)
          armGestureListeners()
        },
      )
    }

    const armGestureListeners = () => {
      if (gestureArmedRef.current) return
      gestureArmedRef.current = true
      const events = ['pointerdown', 'keydown', 'touchend'] as const
      const armed: (() => void)[] = []
      for (const type of events) {
        const fire = () => {
          if (retryHandledRef.current) return
          retryHandledRef.current = true
          attemptStart()
        }
        window.addEventListener(type, fire, { once: true, passive: true })
        armed.push(() => window.removeEventListener(type, fire))
      }
      cleanup = () => {
        for (const remove of armed) remove()
      }
    }

    let cleanup: () => void = () => {}
    attemptStart()

    return () => {
      cleanup()
    }
  }, [isReady, src])

  if (!isReady || !src) return null

  const togglePlay = () => {
    const element = audioRef.current
    if (!element) return
    if (element.paused) {
      element.play().then(
        () => {
          setIsPlaying(true)
          setWaitingForTap(false)
        },
        () => setIsPlaying(false),
      )
    } else {
      element.pause()
      setIsPlaying(false)
      setWaitingForTap(false)
    }
  }

  return (
    <div className="fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 p-2 shadow-lg backdrop-blur-sm">
      <audio ref={audioRef} src={src} loop preload="auto" muted={isMuted} />
      {waitingForTap && (
        <span className="px-1.5 text-[11px] font-semibold tracking-wide text-stone-500">
          Tap for sound
        </span>
      )}
      <button
        onClick={togglePlay}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white transition-colors hover:bg-rose-600"
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-1 h-5 w-5" />}
      </button>
      <button
        onClick={() => setIsMuted((muted) => !muted)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition-colors hover:bg-stone-200"
        aria-label={isMuted ? 'Unmute music' : 'Mute music'}
      >
        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>
    </div>
  )
}