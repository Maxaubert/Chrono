import { useState } from 'react'
import SetupMockA from './SetupMockA'
import SetupMockB from './SetupMockB'
import SetupMockC from './SetupMockC'
import SetupMockD from './SetupMockD'

/**
 * Throwaway gallery: 4 layout directions for the Setup screen, switchable via
 * tabs. Served at ?setupmock=1. Delete once a direction is chosen and the real
 * SetupScreen is restyled.
 */

const MOCKS = [
  ['A', 'Centered HUD panel', SetupMockA],
  ['B', 'Two-column dashboard', SetupMockB],
  ['C', 'Stepped wizard', SetupMockC],
  ['D', 'Sidebar + form', SetupMockD],
] as const

export default function SetupMockShowcase() {
  const [i, setI] = useState(0)
  const Current = MOCKS[i][2]
  return (
    <div className="smshow">
      <style>{BAR_CSS}</style>
      <div className="smbar">
        <span className="smtitle">SETUP SCREEN &middot; MOCKUPS</span>
        <div className="smtabs">
          {MOCKS.map(([id, label], n) => (
            <button
              key={id}
              className={n === i ? 'on' : ''}
              onClick={() => setI(n)}
            >
              {id} &middot; {label}
            </button>
          ))}
        </div>
      </div>
      <Current />
    </div>
  )
}

const BAR_CSS = `
.smshow{min-height:100vh;background:#08060f}
.smbar{position:sticky;top:0;z-index:100;display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;
  padding:12px 22px;background:#0a0a12;border-bottom:1px solid #211f33;font-family:'Segoe UI',Verdana,system-ui,sans-serif}
.smtitle{font-weight:800;letter-spacing:3px;font-size:12px;color:#9a6bff;text-transform:uppercase}
.smtabs{display:flex;gap:8px;flex-wrap:wrap}
.smtabs button{cursor:pointer;background:#121018;color:#b9a9e6;border:1px solid #2a2640;font-size:12px;font-weight:700;letter-spacing:.5px;padding:7px 13px;border-radius:6px}
.smtabs button.on{background:#9a6bff;color:#0f0820;border-color:#9a6bff}
`
