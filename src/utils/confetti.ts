import confetti from 'canvas-confetti'

export function fireGrandBurst() {
  const defaults = {
    spread: 360,
    ticks: 220,
    gravity: 0.9,
    scalar: 1.1,
    origin: { y: 0.35, x: 0.5 },
  }
  confetti({
    ...defaults,
    particleCount: 140,
    startVelocity: 42,
    colors: ['#f6c6b6', '#e0b3f2', '#c9b8ff', '#fde8cf', '#ffffff', '#f7b267'],
    shapes: ['circle', 'square', 'star'],
  })
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 90,
      scalar: 0.9,
      startVelocity: 34,
      colors: ['#ffffff', '#fde8cf', '#f6c6b6', '#ffd98a'],
      shapes: ['circle', 'star'],
    })
  }, 250)
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 70,
      scalar: 0.8,
      startVelocity: 28,
      colors: ['#c9b8ff', '#e0b3f2', '#ffffff'],
      shapes: ['square'],
    })
  }, 520)
}

export function fireSideCannons() {
  const end = Date.now() + 1200
  const colors = ['#f6c6b6', '#e0b3f2', '#c9b8ff', '#fde8cf', '#ffffff']
  ;(function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 62,
      origin: { x: 0, y: 0.6 },
      colors,
      ticks: 160,
    })
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 62,
      origin: { x: 1, y: 0.6 },
      colors,
      ticks: 160,
    })
    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  })()
}

export function fireContinuousSparkle(durationMs = 2200) {
  const end = Date.now() + durationMs
  const colors = ['#fff7e6', '#ffd98a', '#f6c6b6', '#fde8cf', '#e0b3f2']
  ;(function frame() {
    confetti({
      particleCount: 3,
      angle: 90,
      spread: 120,
      startVelocity: 14,
      gravity: 0.55,
      ticks: 130,
      scalar: 0.72,
      origin: { x: Math.random(), y: Math.random() * 0.3 },
      colors,
      shapes: ['circle', 'star'],
    })
    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  })()
}

export function fireGoldenSpark() {
  const colors = ['#ffd98a', '#fff7e6', '#fde8cf', '#f6c6b6', '#ffb84d']
  confetti({
    particleCount: 120,
    spread: 160,
    startVelocity: 38,
    gravity: 1.05,
    ticks: 200,
    scalar: 0.95,
    origin: { y: 0.55 },
    colors,
    shapes: ['circle', 'star'],
  })
  setTimeout(() => {
    confetti({
      particleCount: 70,
      spread: 200,
      startVelocity: 22,
      gravity: 1.2,
      ticks: 240,
      scalar: 0.7,
      origin: { y: 0.6 },
      colors,
      shapes: ['circle'],
    })
  }, 180)
  setTimeout(() => fireContinuousSparkle(900), 420)
}

export function fireGoldenRain(durationMs = 1800) {
  const end = Date.now() + durationMs
  const colors = ['#ffd98a', '#f7b267', '#fff7e6', '#fde8cf', '#e8924a']
  ;(function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.65 },
      colors,
      ticks: 240,
      gravity: 0.95,
      scalar: 0.9,
    })
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.65 },
      colors,
      ticks: 240,
      gravity: 0.95,
      scalar: 0.9,
    })
    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  })()
}

export function fireHeartRain(durationMs = 1500) {
  const heart = confetti.shapeFromPath({
    path: 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z',
    matrix: new DOMMatrix([0.0333, 0, 0, 0.0333, 0, 0]),
  })
  const end = Date.now() + durationMs
  const colors = ['#ffb3ba', '#f6c6b6', '#e0b3f2', '#ffffff']
  ;(function frame() {
    confetti({
      particleCount: 4,
      spread: 90,
      startVelocity: 28,
      gravity: 0.6,
      scalar: 1.6,
      ticks: 180,
      origin: { x: Math.random(), y: -0.1 },
      colors,
      shapes: [heart],
    })
    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  })()
}