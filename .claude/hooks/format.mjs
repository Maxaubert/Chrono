// PostToolUse hook: format the file Claude just edited with Prettier.
// Reads the hook payload from stdin, extracts the file path, formats only
// supported extensions, and never blocks the edit (always exits 0).
import { execFileSync } from 'node:child_process'

let raw = ''
process.stdin.on('data', (chunk) => (raw += chunk))
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(raw || '{}')
    const file = data?.tool_input?.file_path
    if (file && /\.(ts|tsx|js|jsx|mjs|json|css|md|html)$/.test(file)) {
      execFileSync('npx', ['prettier', '--write', file], {
        stdio: 'ignore',
        shell: true,
      })
    }
  } catch {
    // Formatting must never block an edit.
  }
  process.exit(0)
})
