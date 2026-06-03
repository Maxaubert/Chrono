import { describe, expect, it } from 'vitest'
import { renderQrDataUrl } from './qr-image'

describe('renderQrDataUrl', () => {
  it('returns a png data url for a token', async () => {
    const url = await renderQrDataUrl('chrono:t:T1')
    expect(url.startsWith('data:image/png;base64,')).toBe(true)
  })
})
