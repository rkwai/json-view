import { describe, expect, it, beforeEach } from 'vitest'

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
      <main>
        <section>
          <button data-clear type="button">Clear</button>
          <textarea id="json-input"></textarea>
        </section>
        <section>
          <button data-copy type="button">Copy</button>
          <button data-download type="button">Download</button>
          <p data-output-hint></p>
          <textarea id="json-output" readonly></textarea>
        </section>
      </main>
      <section>
        <p data-status></p>
        <p data-metrics></p>
      </section>
    </div>
  `
}

function mount() {
  renderDom()
  boot(document)
}

describe('JSON View app', () => {
  beforeEach(() => {
    mount()
  })

  it('formats valid JSON and writes it to the output textarea', () => {
    const input = document.querySelector<HTMLTextAreaElement>('#json-input')!
    const output = document.querySelector<HTMLTextAreaElement>('#json-output')!
    const copyButton = document.querySelector<HTMLButtonElement>('[data-copy]')!

    input.value = '{"foo":"bar"}'
    input.dispatchEvent(new Event('input'))

    expect(output.value).toBe('{\n  "foo": "bar"\n}')
    expect(copyButton.disabled).toBe(false)
  })

  it('surfaces parse errors without crashing', () => {
    const input = document.querySelector<HTMLTextAreaElement>('#json-input')!
    const output = document.querySelector<HTMLTextAreaElement>('#json-output')!
    const status = document.querySelector<HTMLElement>('[data-status]')!

    input.value = '{"foo":}'
    input.dispatchEvent(new Event('input'))

    expect(output.value).toBe('')
    expect(status.dataset.state).toBe('error')
  })

  it('re-runs formatting when the indent changes', () => {
    const input = document.querySelector<HTMLTextAreaElement>('#json-input')!
    const output = document.querySelector<HTMLTextAreaElement>('#json-output')!
    const indent = document.querySelector<HTMLSelectElement>('select[data-indent]')!

    input.value = '{"foo":{"deep":true}}'
    input.dispatchEvent(new Event('input'))

    indent.value = '4'
    indent.dispatchEvent(new Event('change'))

    expect(output.value).toContain('    "deep"')
  })
})
