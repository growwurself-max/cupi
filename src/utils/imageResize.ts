export interface ResizeImageOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read image.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not decode image.'))
    image.src = src
  })
}

function fitWithin(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  let w = Math.max(1, Math.round(width))
  let h = Math.max(1, Math.round(height))

  if (w > maxWidth) {
    h = Math.max(1, Math.round((h * maxWidth) / w))
    w = maxWidth
  }
  if (h > maxHeight) {
    w = Math.max(1, Math.round((w * maxHeight) / h))
    h = maxHeight
  }
  return { width: w, height: h }
}

/**
 * Resizes and compresses an uploaded photo to a lightweight, high-quality
 * base64 JPEG string (typically ~80KB–150KB) so raw phone photos never blow
 * past the checkout payload limits.
 */
export async function resizeAndCompressImage(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.8,
): Promise<string> {
  let source: ImageBitmap | HTMLImageElement
  let sourceWidth: number
  let sourceHeight: number

  // Preferred path: createImageBitmap applies EXIF orientation so iPhone
  // portraits are not drawn sideways onto the canvas.
  if (typeof createImageBitmap === 'function') {
    try {
      source = await createImageBitmap(file, { imageOrientation: 'from-image' })
      sourceWidth = source.width
      sourceHeight = source.height
    } catch {
      const dataUrl = await readAsDataUrl(file)
      source = await loadImage(dataUrl)
      sourceWidth = source.naturalWidth
      sourceHeight = source.naturalHeight
    }
  } else {
    const dataUrl = await readAsDataUrl(file)
    source = await loadImage(dataUrl)
    sourceWidth = source.naturalWidth
    sourceHeight = source.naturalHeight
  }

  if (!sourceWidth || !sourceHeight) {
    throw new Error('Image has no readable dimensions.')
  }

  const { width, height } = fitWithin(sourceWidth, sourceHeight, maxWidth, maxHeight)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) {
    throw new Error('Canvas context unavailable.')
  }

  // JPEG has no alpha channel — paint white first so transparent PNGs don't
  // come out with black backgrounds.
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(source, 0, 0, width, height)

  return canvas.toDataURL('image/jpeg', quality)
}