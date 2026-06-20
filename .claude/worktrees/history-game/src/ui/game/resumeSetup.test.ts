import { beforeEach, expect, test } from 'vitest'
import {
  clearResumeSetup,
  markResumeSetup,
  peekResumeSetup,
} from './resumeSetup'

beforeEach(() => sessionStorage.clear())

test('peek is false when nothing was marked', () => {
  expect(peekResumeSetup()).toBe(false)
})

test('mark sets the flag; peek reads it without consuming', () => {
  markResumeSetup()
  expect(peekResumeSetup()).toBe(true)
  expect(peekResumeSetup()).toBe(true)
})

test('clear removes the flag', () => {
  markResumeSetup()
  clearResumeSetup()
  expect(peekResumeSetup()).toBe(false)
})
