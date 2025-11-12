import { vi } from 'vitest'

if (!('clipboard' in navigator)) {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
  })
} else if (!navigator.clipboard?.writeText) {
  Object.assign(navigator.clipboard as Clipboard, {
    writeText: vi.fn().mockResolvedValue(undefined),
  })
}

if (!('requestAnimationFrame' in globalThis)) {
  globalThis.requestAnimationFrame = (cb: FrameRequestCallback) =>
    window.setTimeout(() => cb(performance.now()), 16)
}
