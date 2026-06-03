// PostToolUse hook: format the file Claude just edited with Prettier.
// Reads the hook payload from stdin, extracts the file path, formats only
// supported extensions, and never blocks the edit (always exits 0).
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

let raw = ''
process.stdin.on('data', (chunk) => (raw += chunk))
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(raw || '{}')
    const file = data?.tool_input?.file_path
    if (file && /\.(ts|tsx|js|jsx|mjs|json|css|md|html)$/.test(file)) {
      // Invoke Prettier's bin through the node binary with no shell, so the file
      // path is passed verbatim as a single argv entry (no shell metacharacter
      // injection). `--` stops a path beginning with `-` being read as a flag.
      const prettierBin = require.resolve('prettier/bin/prettier.cjs')
      execFileSync(process.execPath, [prettierBin, '--write', '--', file], {
        stdio: 'ignore',
      })
    }
  } catch {
    // Formatting must never block an edit.
  }
  process.exit(0)
})
