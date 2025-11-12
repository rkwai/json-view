const encoder = new TextEncoder()

export interface FormatStats {
  bytes: number
  durationMs: number
}

export interface FormatSuccess {
  ok: true
  formatted: string
  stats: FormatStats
}

export interface FormatFailure {
  ok: false
  error: string
  stats: FormatStats
}

export type FormatResult = FormatSuccess | FormatFailure

export interface PrettyPrintOptions {
  indent: number
}

export function formatJson(value: string, options: PrettyPrintOptions): FormatResult {
  const start = performance.now()
  const bytes = encoder.encode(value).length

  if (!value.trim()) {
    return {
      ok: true,
      formatted: '',
      stats: { bytes, durationMs: performance.now() - start },
    }
  }

  try {
    const parsed = JSON.parse(value)
    const formatted = JSON.stringify(parsed, null, options.indent)
    return {
      ok: true,
      formatted,
      stats: { bytes, durationMs: performance.now() - start },
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unable to parse JSON input.',
      stats: { bytes, durationMs: performance.now() - start },
    }
  }
}
