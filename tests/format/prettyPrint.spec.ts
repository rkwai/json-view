import { describe, expect, it } from 'vitest'

import { formatJson } from '../../src/format/prettyPrint'

describe('formatJson', () => {
  it('pretty prints minified JSON with the requested indent', () => {
    const result = formatJson('{"foo":{"bar":true}}', { indent: 4 })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.formatted).toBe('{\n    "foo": {\n        "bar": true\n    }\n}')
    }
  })

  it('returns a helpful error when parsing fails', () => {
    const result = formatJson('{"broken":}', { indent: 2 })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toMatch(/Unexpected token|position/i)
    }
  })

  it('treats empty input as a no-op', () => {
    const result = formatJson('', { indent: 2 })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.formatted).toBe('')
    }
  })
})
