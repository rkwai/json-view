import { copyText, downloadText } from './components/actions'
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

export function boot(doc: Document = document): void {
  const input = expectElement(
    doc.querySelector<HTMLTextAreaElement>('#json-input'),
    'input textarea',
  )
  const output = expectElement(
    doc.querySelector<HTMLTextAreaElement>('#json-output'),
    'output textarea',
  )
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
    const raw = input.value
    if (!raw.trim()) {
      output.value = ''
      state.lastFormatted = ''
      setStatus(DEFAULT_STATUS, '')
      setOutputHint('Paste JSON to see formatted output instantly.')
      updateButtons(false)
      return
    }

    const result = formatJson(raw, { indent: state.indent })

    if (result.ok) {
      state.lastFormatted = result.formatted
      output.value = result.formatted
      setStatus('JSON formatted successfully', buildMetrics(result.stats.bytes, result.stats.durationMs))
      setOutputHint('Output refreshed automatically.')
      updateButtons(Boolean(result.formatted))
    } else {
      state.lastFormatted = ''
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
      input.value = text
      runFormatter()
    })
  }

  function handlePaste(event: ClipboardEvent): void {
    const text = event.clipboardData?.getData('text')
    if (!text) return
    // Allow the paste to complete, then format.
    requestAnimationFrame(() => {
      if (input.value === text) {
        runFormatter()
      }
    })
  }

  function toggleTheme(enabled: boolean): void {
    const root = doc.documentElement
    root.dataset.theme = enabled ? 'dark' : 'light'
  }

  input.addEventListener('input', runFormatter)
  input.addEventListener('paste', handlePaste)
  input.addEventListener('dragover', (event) => event.preventDefault())
  input.addEventListener('drop', handleDrop)

  clearBtn.addEventListener('click', () => {
    clearCopyStatus()
    input.value = ''
    output.value = ''
    state.lastFormatted = ''
    setStatus(DEFAULT_STATUS)
    setOutputHint('Paste JSON to see formatted output instantly.')
    updateButtons(false)
    input.focus()
  })

  indentSelect.addEventListener('change', () => {
    state.indent = Number.parseInt(indentSelect.value, 10) || 2
    runFormatter()
    input.focus()
  })

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

  themeToggle.addEventListener('change', () => toggleTheme(themeToggle.checked))
  toggleTheme(themeToggle.checked)

  setStatus(DEFAULT_STATUS)
  setOutputHint('Paste JSON to see formatted output instantly.')
  updateButtons(false)

  requestAnimationFrame(() => {
    input.focus()
  })
}
