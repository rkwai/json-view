import { beforeEach, describe, expect, it, vi } from 'vitest'

const editors = new Map<
  string,
  {
    getValue: () => string
    setValue: (value: string) => void
    focus: () => void
    onChange: (cb: () => void) => void
    setTheme: ReturnType<typeof vi.fn>
  }
>()

vi.mock('../src/editor/createEditor', () => {
  return {
    createEditor: (element: HTMLElement) => {
      const listeners = new Set<() => void>()
      let value = ''
      const editor = {
        getValue: () => value,
        setValue: (next: string) => {
          value = next
          listeners.forEach((listener) => listener())
        },
        focus: vi.fn(),
        onChange: (listener: () => void) => {
          listeners.add(listener)
        },
        setTheme: vi.fn(),
      }
      editors.set(element.id, editor)
      return editor
    },
  }
})

import { boot } from '../src/app'

function renderDom(): void {
  document.body.innerHTML = `
    <div id="app">
      <header>
        <label>
          <select data-indent>
            <option value="2" selected>2 spaces</option>
            <option value="4">4 spaces</option>
          </select>
        </label>
        <label>
          <input type="checkbox" data-theme-toggle />
        </label>
      </header>
      <section>
        <button data-clear type="button">Clear</button>
        <div id="json-input" data-editor="input"></div>
      </section>
      <section>
        <button data-copy type="button">Copy</button>
        <button data-download type="button">Download</button>
        <p data-output-hint></p>
        <div id="json-output" data-editor="output"></div>
      </section>
      <p data-status></p>
      <p data-metrics></p>
    </div>
  `
}

function mount() {
  renderDom()
  boot(document)
}

function setInputValue(value: string) {
  const editor = editors.get('json-input')
  if (!editor) {
    throw new Error('Input editor not initialized')
  }
  editor.setValue(value)
}

function getOutputValue(): string {
  const editor = editors.get('json-output')
  if (!editor) {
    throw new Error('Output editor not initialized')
  }
  return editor.getValue()
}

describe('JSON View app', () => {
  beforeEach(() => {
    editors.clear()
    mount()
  })

  it('formats valid JSON and writes it to the output editor', () => {
    const copyButton = document.querySelector<HTMLButtonElement>('[data-copy]')!

    setInputValue('{"foo":"bar"}')

    expect(getOutputValue()).toBe('{\n  "foo": "bar"\n}')
    expect(copyButton.disabled).toBe(false)
  })

  it('surfaces parse errors without crashing', () => {
    const status = document.querySelector<HTMLElement>('[data-status]')!

    setInputValue('{"foo":}')

    expect(getOutputValue()).toBe('')
    expect(status.dataset.state).toBe('error')
  })

  it('re-runs formatting when the indent changes', () => {
    const indent = document.querySelector<HTMLSelectElement>('select[data-indent]')!

    setInputValue('{"foo":{"deep":true}}')

    indent.value = '4'
    indent.dispatchEvent(new Event('change'))

    expect(getOutputValue()).toContain('    "deep"')
  })
})
