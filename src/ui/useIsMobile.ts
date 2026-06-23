import { useEffect, useState } from 'react'

/**
 * The single source of truth for the desktop/mobile fork. Returns true on phone
 * widths (<= 760px). Desktop components stay untouched; the mobile play screen
 * and mobile-first CSS switch on this. Reacts to resize and orientation change so
 * rotating a phone or resizing a desktop window flips layouts live.
 *
 * 760px matches the existing setup/history `@media (max-width: 760px)`
 * breakpoints, so the whole app crosses into "mobile" at one consistent width.
 */
const MOBILE_QUERY = '(max-width: 760px)'

function matches(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(MOBILE_QUERY).matches
}

export function useIsMobile(): boolean {
  const [mobile, setMobile] = useState<boolean>(matches)

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY)
    const onChange = () => setMobile(mql.matches)
    onChange() // sync in case the width changed before the listener attached
    // Safari < 14 only supports the deprecated addListener signature.
    if (mql.addEventListener) mql.addEventListener('change', onChange)
    else mql.addListener(onChange)
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', onChange)
      else mql.removeListener(onChange)
    }
  }, [])

  return mobile
}
