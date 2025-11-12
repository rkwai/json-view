import { copyText, downloadText } from './components/actions'
import {
  createEditor,
  type EditorOptions,
  type EditorTheme,
  type JsonEditor,
} from './editor/createEditor'
import { formatJson } from './format/prettyPrint'

interface FormatterState {
  indent: number
  lastFormatted: string
}

const DEFAULT_STATUS = 'Waiting for JSON…'

function expectElement<T extends Element>(value: T | null, description: string): T {
  if (!value) {
    throw new Error(`JSON View failed to initialize: missing ${description}.`)
  }
  return value
}

export interface BootOptions {
  createEditor?: (host: HTMLElement, options?: EditorOptions) => JsonEditor
}

export function boot(doc: Document = document, options: BootOptions = {}): void {
  const status = expectElement(doc.querySelector<HTMLElement>('[data-status]'), 'status text')
  const metrics = expectElement(
    doc.querySelector<HTMLElement>('[data-metrics]'),
    'status metrics',
  )
  const outputHint = expectElement(
    doc.querySelector<HTMLElement>('[data-output-hint]'),
    'output hint text',
  )
  const copyBtn = expectElement(
    doc.querySelector<HTMLButtonElement>('[data-copy]'),
    'copy button',
  )
  const downloadBtn = expectElement(
    doc.querySelector<HTMLButtonElement>('[data-download]'),
    'download button',
  )
  const clearBtn = expectElement(doc.querySelector<HTMLButtonElement>('[data-clear]'), 'clear button')
  const indentSelect = expectElement(
    doc.querySelector<HTMLSelectElement>('select[data-indent]'),
    'indent select',
  )
  const themeToggle = expectElement(
    doc.querySelector<HTMLInputElement>('[data-theme-toggle]'),
    'theme toggle',
  )
  const inputHost = expectElement(
    doc.querySelector<HTMLElement>('#json-input'),
    'input editor host',
  )
  const outputHost = expectElement(
    doc.querySelector<HTMLElement>('#json-output'),
    'output editor host',
  )

  const editorFactory = options.createEditor ?? createEditor
  const currentTheme: EditorTheme = themeToggle.checked ? 'dark' : 'light'
  const inputEditor = editorFactory(inputHost, { readOnly: false, theme: currentTheme })
  const outputEditor = editorFactory(outputHost, { readOnly: true, theme: currentTheme })

  const state: FormatterState = {
    indent: Number.parseInt(indentSelect.value, 10) || 2,
    lastFormatted: '',
  }

  let copyStatusTimeout: ReturnType<typeof setTimeout> | null = null

  function setStatus(message: string, detail = '', isError = false): void {
    status.textContent = message
    status.dataset.state = isError ? 'error' : 'default'
    metrics.textContent = detail
  }

  function setOutputHint(message: string): void {
    outputHint.textContent = message
  }

  function updateButtons(hasContent: boolean): void {
    copyBtn.disabled = !hasContent
    downloadBtn.disabled = !hasContent
  }

  function describeBytes(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`
    }

    const kb = bytes / 1024
    if (kb < 1024) {
      return `${kb.toFixed(1)} kB`
    }

    return `${(kb / 1024).toFixed(2)} MB`
  }

  function describeDuration(duration: number): string {
    if (duration < 1) {
      return '<1 ms'
    }
    return `${duration.toFixed(1)} ms`
  }

  function clearCopyStatus(): void {
    if (copyStatusTimeout) {
      clearTimeout(copyStatusTimeout)
      copyStatusTimeout = null
    }
  }

  function runFormatter(): void {
    clearCopyStatus()
    const raw = inputEditor.getValue()
    if (!raw.trim()) {
      state.lastFormatted = ''
      outputEditor.setValue('')
      setStatus(DEFAULT_STATUS, '')
      setOutputHint('Paste JSON to see formatted output instantly.')
      updateButtons(false)
      return
    }

    const result = formatJson(raw, { indent: state.indent })

    if (result.ok) {
      state.lastFormatted = result.formatted
      outputEditor.setValue(result.formatted)
      setStatus('JSON formatted successfully', buildMetrics(result.stats.bytes, result.stats.durationMs))
      setOutputHint('Output refreshed automatically.')
      updateButtons(Boolean(result.formatted))
    } else {
      state.lastFormatted = ''
      outputEditor.setValue('')
      setStatus(result.error, buildMetrics(result.stats.bytes, result.stats.durationMs), true)
      setOutputHint('Fix the JSON above and the output will refresh.')
      updateButtons(false)
    }
  }

  function buildMetrics(bytes: number, duration: number): string {
    return `${describeBytes(bytes)} • ${describeDuration(duration)}`
  }

  function handleDrop(event: DragEvent): void {
    event.preventDefault()
    const file = event.dataTransfer?.files?.[0]
    if (!file) return

    file.text().then((text) => {
      inputEditor.setValue(text)
      inputEditor.focus()
    })
  }

  function applyTheme(variant: EditorTheme): void {
    doc.documentElement.dataset.theme = variant
    inputEditor.setTheme?.(variant)
    outputEditor.setTheme?.(variant)
  }

  inputHost.addEventListener('dragover', (event) => {
    event.preventDefault()
  })
  inputHost.addEventListener('drop', handleDrop)

  clearBtn.addEventListener('click', () => {
    clearCopyStatus()
    inputEditor.setValue('')
    state.lastFormatted = ''
    setStatus(DEFAULT_STATUS)
    setOutputHint('Paste JSON to see formatted output instantly.')
    updateButtons(false)
    inputEditor.focus()
  })

  indentSelect.addEventListener('change', () => {
    state.indent = Number.parseInt(indentSelect.value, 10) || 2
    runFormatter()
    inputEditor.focus()
  })

  inputEditor.onChange(runFormatter)

  copyBtn.addEventListener('click', async () => {
    if (!state.lastFormatted) return
    const detail = metrics.textContent ?? ''
    await copyText(state.lastFormatted)
    setStatus('Copied formatted JSON to clipboard', detail)
    clearCopyStatus()
    copyStatusTimeout = setTimeout(() => {
      setStatus('JSON formatted successfully', detail)
      copyStatusTimeout = null
    }, 1200)
  })

  downloadBtn.addEventListener('click', () => {
    if (!state.lastFormatted) return
    downloadText(state.lastFormatted)
  })

  doc.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      runFormatter()
    }
  })

  themeToggle.addEventListener('change', () => {
    const variant: EditorTheme = themeToggle.checked ? 'dark' : 'light'
    applyTheme(variant)
  })
  applyTheme(currentTheme)

  setStatus(DEFAULT_STATUS)
  setOutputHint('Paste JSON to see formatted output instantly.')
  updateButtons(false)

  requestAnimationFrame(() => {
    inputEditor.focus()
  })
}
