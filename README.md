# JSON View

JSON View is an ultra-lightweight, client-only JSON formatter built to open instantly, auto-focus on the input, and prettify data the moment you paste it. The entire experience ships as static assets, so it can live on any CDN or even be opened locally without a server.

## Product Goals
- **Zero-latency startup:** Inline scripts and critical CSS are inlined so the page paints in under 50 ms on modern devices. No analytics, no trackers, no network calls after the initial load.
- **Single keystroke workflow:** When the tab loads, focus lands on the left editor. Pasting triggers parsing, formatting, and syntax highlighting; the right editor updates immediately.
- **Mobile parity:** Below 768 px the panes stack vertically, controls grow to thumb-friendly targets, and fonts adjust for readability without horizontal scrolling.

## Experience Blueprint
1. Left pane (`#json-input`) accepts raw/unformatted JSON and supports `Cmd/Ctrl+Enter` to re-run formatting.
2. Right pane (`#json-output`) is read-only, shows formatted JSON, and exposes quick-copy + download buttons.
3. A slim status bar surfaces validation errors, byte length, and formatting duration (<5 ms target).
4. Optional settings drawer lets users toggle indentation (2/4 spaces), collapse levels, and dark/light theme.

## Technical Approach
- **Stack:** Plain TypeScript + Vite for bundling, with vanilla web components for editors. Monaco or CodeMirror stay optional to keep bundle size under 30 kB; default editor uses native `<textarea>`.
- **Parsing:** `JSON.parse` guarded by `try/catch`; errors hydrate the status bar without blocking input. Formatting relies on `JSON.stringify(value, null, indent)` with streaming chunk updates for large payloads.
- **Performance tricks:** Use `requestIdleCallback` to pre-compute syntax colors, `ResizeObserver` to keep panes balanced, and avoid re-parsing when users tweak settings that do not touch the source.

## Local Development (once tooling lands)
```bash
npm install              # install Vite, TypeScript, ESLint, Prettier
npm run dev              # lightning-fast dev server on http://localhost:5173
npm run build && preview # create static assets and serve them for smoke testing
```

## Roadmap
- Progressive Web App metadata so JSON View can run offline on mobile.
- Shareable URLs that encode formatting preferences without storing user data.
- Optional diff mode: paste original JSON on the left, compare to a patched version on the right.
