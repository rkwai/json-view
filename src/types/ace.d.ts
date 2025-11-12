declare module 'ace-builds/src-noconflict/ace' {
  import type ace from 'ace-builds'
  export default ace
}

declare module 'ace-builds/src-noconflict/mode-json' {
  const mode: unknown
  export default mode
}

declare module 'ace-builds/src-noconflict/theme-tomorrow_night_blue' {
  const theme: unknown
  export default theme
}

declare module 'ace-builds/src-noconflict/theme-github' {
  const theme: unknown
  export default theme
}

declare module 'ace-builds/src-noconflict/ext-language_tools' {
  const tools: unknown
  export default tools
}

declare module 'ace-builds/src-noconflict/worker-json.js' {
  const worker: string
  export default worker
}
