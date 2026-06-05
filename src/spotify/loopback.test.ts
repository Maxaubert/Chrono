import { expect, test } from 'vitest'
import { loopbackRedirect } from './loopback'

test('redirects localhost to 127.0.0.1, preserving path and query', () => {
  expect(
    loopbackRedirect('http://localhost:5173/callback?code=abc', 'localhost'),
  ).toBe('http://127.0.0.1:5173/callback?code=abc')
})

test('leaves 127.0.0.1 alone', () => {
  expect(loopbackRedirect('http://127.0.0.1:5173/', '127.0.0.1')).toBeNull()
})

test('leaves other hosts alone', () => {
  expect(
    loopbackRedirect('https://chrono.example/', 'chrono.example'),
  ).toBeNull()
})
