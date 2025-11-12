import ace from 'ace-builds/src-noconflict/ace'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/theme-tomorrow_night_blue'
import 'ace-builds/src-noconflict/theme-github'
import 'ace-builds/src-noconflict/ext-language_tools'

const workerUrl = new URL('ace-builds/src-noconflict/worker-json.js', import.meta.url).toString()
ace.config.setModuleUrl('ace/mode/json_worker', workerUrl)

const THEME_MAP = {
  light: 'ace/theme/github',
  dark: 'ace/theme/tomorrow_night_blue',
} as const

export type EditorTheme = keyof typeof THEME_MAP

export interface EditorOptions {
  readOnly?: boolean
  theme?: EditorTheme
}

export interface JsonEditor {
  getValue(): string
  setValue(value: string): void
  focus(): void
  onChange(listener: () => void): void
  setReadOnly?(value: boolean): void
  setTheme?(variant: EditorTheme): void
  destroy(): void
}

export function createEditor(host: HTMLElement, options: EditorOptions = {}): JsonEditor {
  const initialTheme = options.theme ?? 'light'

  const editor = ace.edit(host, {
    mode: 'ace/mode/json',
    theme: THEME_MAP[initialTheme],
    minLines: 18,
    maxLines: Infinity,
    autoScrollEditorIntoView: true,
    highlightActiveLine: !options.readOnly,
    readOnly: options.readOnly ?? false,
    tabSize: 2,
    useSoftTabs: true,
    wrap: true,
  })

  editor.session.setMode('ace/mode/json')
  editor.session.setUseWrapMode(true)
  editor.session.setUseWorker(!options.readOnly)
  editor.setShowPrintMargin(false)
  editor.renderer.setShowGutter(true)
  editor.renderer.setScrollMargin(12, 12, 12, 12)
  editor.renderer.setPadding(12)

  const resizeObserver = new ResizeObserver(() => editor.resize())
  resizeObserver.observe(host)

  let activeTheme: EditorTheme = initialTheme
  const setTheme = (variant: EditorTheme) => {
    if (activeTheme === variant) return
    activeTheme = variant
    editor.setTheme(THEME_MAP[variant])
  }

  return {
    getValue: () => editor.getValue(),
    setValue: (value: string) => {
      if (editor.getValue() === value) return
      editor.setValue(value, -1)
    },
    focus: () => editor.focus(),
    onChange: (listener: () => void) => {
      editor.session.on('change', listener)
    },
    setReadOnly: (value: boolean) => {
      editor.setReadOnly(value)
    },
    setTheme,
    destroy: () => {
      resizeObserver.disconnect()
      editor.destroy()
      host.innerHTML = ''
    },
  }
}
