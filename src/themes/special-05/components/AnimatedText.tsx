import { m } from 'framer-motion'
import { useMemo } from 'react'

export type TextEffect =
  | 'masked'
  | 'blur'
  | 'spring'
  | 'flip'
  | 'wave'
  | 'typewriter'
  | 'scale'
  | 'shimmer'

interface AnimatedTextProps {
  text: string
  effect?: TextEffect
  reduce?: boolean
  name?: boolean
  highlightText?: string
  className?: string
}

const EFFECTS: Record<TextEffect, { from: Record<string, number | string>; duration: number }> = {
  masked: { from: { opacity: 0, y: '0.8em', clipPath: 'inset(0 0 100% 0)' }, duration: 0.55 },
  blur: { from: { opacity: 0, y: 8 }, duration: 0.48 },
  spring: { from: { opacity: 0, scale: 0.68, y: 12 }, duration: 0.6 },
  flip: { from: { opacity: 0, rotateX: 48, y: 8 }, duration: 0.6 },
  wave: { from: { opacity: 0, y: 14, rotate: -7 }, duration: 0.48 },
  typewriter: { from: { opacity: 0, y: 3 }, duration: 0.24 },
  scale: { from: { opacity: 0, scale: 0.75 }, duration: 0.6 },
  shimmer: { from: { opacity: 0, y: 8 }, duration: 0.5 },
}

export function AnimatedText({
  text,
  effect = 'masked',
  reduce = false,
  name = false,
  highlightText,
  className = '',
}: AnimatedTextProps) {
  const characters = useMemo(() => Array.from(text), [text])
  const highlightedCharacters = useMemo(() => {
    const result = new Set<number>()
    const needle = highlightText ? Array.from(highlightText) : []
    if (needle.length === 0) return result
    for (let start = 0; start <= characters.length - needle.length; start += 1) {
      if (needle.every((character, offset) => characters[start + offset] === character)) {
        for (let offset = 0; offset < needle.length; offset += 1) result.add(start + offset)
      }
    }
    return result
  }, [characters, highlightText])
  if (text.length === 0) return null

  return (
    <span
      aria-label={text}
      role="text"
      className={`relative inline-block max-w-full whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${name ? 'special-name' : ''} ${className}`}
    >
      <m.span
        aria-hidden
        className="inline-block max-w-full"
        initial={reduce || effect !== 'blur' ? undefined : { filter: 'blur(4px)' }}
        animate={effect === 'blur' && !reduce ? { filter: 'blur(0px)' } : undefined}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <span aria-hidden className="inline" style={{ perspective: effect === 'flip' ? 800 : undefined }}>
          {characters.map((character, index) => {
            const isName = name || highlightedCharacters.has(index)
            const delay = reduce ? 0 : index * (isName ? 0.035 : effect === 'typewriter' ? 0.018 : 0.024)
            const characterEffect = EFFECTS[isName ? 'spring' : effect]
            return (
              <m.span
                key={`${character}-${index}`}
                aria-hidden
                className={`${character === ' ' ? '' : 'relative inline-block'} ${effect === 'shimmer' || isName ? 'special-text-shimmer' : ''} ${isName ? 'special-name' : ''}`}
                initial={reduce ? { opacity: 0 } : characterEffect.from}
                animate={
                  reduce
                    ? { opacity: 1 }
                    : {
                        opacity: 1,
                        y: effect === 'wave' && !isName ? [14, -3, 0] : 0,
                        scale: (effect === 'spring' || isName) ? [0.68, 1.12, 1] : 1,
                        rotateX: 0,
                        rotate: isName ? [0, index % 2 ? 2 : -2, 0] : 0,
                        clipPath: 'inset(0 0 0 0)',
                      }
                }
                transition={
                  reduce
                    ? { duration: 0.3 }
                    : {
                        delay,
                        duration: characterEffect.duration,
                        ease: (effect === 'spring' || isName) ? [0.2, 1.5, 0.3, 1] : [0.22, 1, 0.36, 1],
                      }
                }
                whileHover={isName && !reduce ? { y: -4, rotate: index % 2 ? 7 : -7, scale: 1.08 } : undefined}
                whileTap={isName && !reduce ? { scale: 0.88, rotate: 0 } : undefined}
                style={{ transformOrigin: 'center bottom' }}
              >
                {character}
              </m.span>
            )
          })}
        </span>
      </m.span>
      {effect === 'typewriter' && !reduce && (
        <m.span
          aria-hidden
          className="special-type-caret absolute bottom-0 right-[-0.15em] h-[1em] w-px bg-current"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ delay: Math.min(characters.length * 0.018, 2), duration: 0.8, repeat: Infinity }}
        />
      )}
    </span>
  )
}

export function RecipientName({ text, reduce = false }: { text: string; reduce?: boolean }) {
  return <AnimatedText text={text} effect="spring" reduce={reduce} name />
}
