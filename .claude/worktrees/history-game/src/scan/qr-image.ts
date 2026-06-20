import QRCode from 'qrcode'

/** Render text as a PNG data URL suitable for an <img src>. */
export function renderQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { margin: 1, width: 192 })
}
