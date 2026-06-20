import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Globals are disabled, so React Testing Library's auto-cleanup is not wired up.
// Unmount rendered trees after each test to avoid duplicate-DOM leakage.
afterEach(() => {
  cleanup()
})
