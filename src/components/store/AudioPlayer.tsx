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

  const audioRef = useRef<HTMLAudioElement | null>(null)

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
    }
  }, [templateId])

  const isCurrent = state.templateId === (templateId ?? null)
  const src = isCurrent ? state.src : null
  const isReady = isCurrent && state.status === 'ready' && src !== null

  useEffect(() => {
    const element = audioRef.current
    if (!isReady || !element) return
    element.play().then(
      () => setIsPlaying(true),
      () => setIsPlaying(false),
    )
  }, [isReady, src])

  if (!isReady || !src) return null

  const togglePlay = () => {
    const element = audioRef.current
    if (!element) return
    if (element.paused) {
      element.play().then(
        () => setIsPlaying(true),
        () => setIsPlaying(false),
      )
    } else {
      element.pause()
      setIsPlaying(false)
    }
  }

  return (
    <div className="fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 p-2 shadow-lg backdrop-blur-sm">
      <audio ref={audioRef} src={src} loop muted={isMuted} />
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