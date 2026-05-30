import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const BG = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80'
const ORANGE = '#FF6700'
const ORANGE_D = '#ea6c0a'
const CARD_BG = '#1e232c'
const CARD_BG2 = '#242931'
const INPUT_BG = 'rgba(255,255,255,0.06)'
const INPUT_BORDER = 'rgba(249,115,22,0.45)'
const INPUT_BORDER_FOCUS = '#f97316'

export default function Login() {
  const { login } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focus, setFocus] = useState('')
  const [showDemo, setShowDemo] = useState(true)
  const [btnHover, setBtnHover] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username.trim() || !form.password.trim()) { setError('All fields are required.'); return }
    setLoading(true); setError('')
    await new Promise(r => setTimeout(r, 700))
    const result = login(form.username.trim(), form.password)
    if (result.success) { addToast('Welcome back! 👋', 'success'); navigate('/dashboard') }
    else { setError(result.message); addToast('Invalid credentials.', 'error') }
    setLoading(false)
  }

  const inp = (field) => ({
    width: '100%', height: '50px', background: INPUT_BG,
    border: `1.5px solid ${focus === field ? '#FF6700' : 'rgba(255,255,255,0.15)'}`,
    borderRadius: '10px', color: '#fff', fontSize: '0.92rem',
    fontFamily: 'inherit', outline: 'none', paddingLeft: '44px',
    paddingRight: field === 'password' ? '44px' : '14px',
    boxSizing: 'border-box', transition: 'border-color 300ms ease-in-out, box-shadow 300ms ease-in-out',
    boxShadow: focus === field ? `0 0 0 2px #FF6700` : 'none',
  })

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
        .login-input::placeholder { color: rgba(255,255,255,0.3); }
      `}</style>

      {/* Full-page background */}
      <div style={{
        minHeight: '100vh', width: '100%', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: '60px 20px',
        backgroundImage: `linear-gradient(rgba(0,0,0,0.70),rgba(0,0,0,0.70)), url(${BG})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        fontFamily: "'Inter',system-ui,-apple-system,sans-serif",
      }}>

        {/* Card wrapper with room for protruding badge */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '440px', paddingTop: '40px' }}>

          {/* Floating orange chef-hat badge */}
          <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: '68px', height: '68px', background: `linear-gradient(135deg, ${ORANGE} 0%, ${ORANGE_D} 100%)`,
            borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2, boxShadow: `0 8px 24px rgba(249,115,22,0.5)`,
          }}>
            {/* Plate + Fork + Spoon line-art icon */}
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              {/* Plate — outer circle */}
              <circle cx="50" cy="50" r="26"/>
              {/* Plate — inner ring */}
              <circle cx="50" cy="50" r="17"/>
              {/* Fork — left side */}
              <line x1="16" y1="22" x2="16" y2="42"/>
              <line x1="11" y1="22" x2="11" y2="31"/>
              <line x1="16" y1="22" x2="16" y2="31"/>
              <line x1="21" y1="22" x2="21" y2="31"/>
              <path d="M11,31 Q16,36 21,31"/>
              <line x1="16" y1="36" x2="16" y2="78"/>
              {/* Spoon — right side */}
              <ellipse cx="84" cy="30" rx="6" ry="9"/>
              <line x1="84" y1="39" x2="84" y2="78"/>
            </svg>
          </div>

          {/* Card */}
          <div style={{
            background: CARD_BG, borderRadius: '22px', paddingTop: '56px',
            paddingBottom: '32px', paddingLeft: '36px', paddingRight: '36px',
            boxShadow: '0 40px 100px rgba(0,0,0,0.7)', animation: 'fadeUp 0.45s cubic-bezier(0.16,1,0.3,1)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>

            {/* Title + tagline */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
                RestaurantIQ
              </h1>
              <p style={{ margin: '5px 0 0', fontSize: '1.05rem', color: 'rgba(255,255,255,0.85)', fontWeight: 400 }}>
                Welcome Back!
              </p>
              <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: 'rgba(255,255,255,0.42)', fontWeight: 400, letterSpacing: '0.01em', lineHeight: 1.5 }}>
                Smart Inventory Management for Modern Restaurants
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                color: '#fca5a5', borderRadius: '9px', padding: '10px 14px',
                fontSize: '0.82rem', marginBottom: '16px', animation: 'shake 0.4s ease',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Username */}
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(249,115,22,0.7)', display: 'flex' }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input className="login-input" style={inp('username')} type="text"
                  placeholder="Username or Email" value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                  onFocus={() => setFocus('username')} onBlur={() => setFocus('')}
                  required autoComplete="username" />
              </div>

              {/* Password */}
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(249,115,22,0.7)', display: 'flex' }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input className="login-input" style={inp('password')} type={showPwd ? 'text' : 'password'}
                  placeholder="Password" value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  onFocus={() => setFocus('password')} onBlur={() => setFocus('')}
                  required autoComplete="current-password" />
                <button type="button" onClick={() => setShowPwd(v => !v)} style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)',
                  display: 'flex', padding: '4px', borderRadius: '6px',
                }} aria-label={showPwd ? 'Hide' : 'Show'}>
                  {showPwd ? (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Remember me + Forgot */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none', fontSize: '0.86rem', color: 'rgba(255,255,255,0.75)' }}>
                  <input type="checkbox" checked={remember} onChange={() => setRemember(v => !v)}
                    style={{ width: '16px', height: '16px', accentColor: ORANGE, cursor: 'pointer', borderRadius: '4px' }} />
                  Remember Me
                </label>
                <a href="#" onClick={e => { e.preventDefault(); addToast('Contact your administrator to reset password.', 'info') }}
                  style={{ fontSize: '0.86rem', color: '#60a5fa', textDecoration: 'underline', textUnderlineOffset: '2px', fontWeight: 500 }}>
                  Forgot Password?
                </a>
              </div>

              {/* LOG IN button */}
              <button type="submit" disabled={loading}
                onMouseEnter={() => setBtnHover(true)} onMouseLeave={() => setBtnHover(false)}
                style={{
                  marginTop: '6px', width: '100%', height: '50px', border: 'none', borderRadius: '10px',
                  background: btnHover && !loading ? ORANGE_D : ORANGE,
                  color: '#fff', fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.1em',
                  cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.75 : 1,
                  transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s',
                  transform: btnHover && !loading ? 'translateY(-1px)' : 'none',
                  boxShadow: btnHover && !loading ? '0 6px 20px rgba(249,115,22,0.5)' : '0 3px 12px rgba(249,115,22,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontFamily: 'inherit',
                }}>
                {loading ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"
                      style={{ animation: 'spin 0.8s linear infinite', marginRight: '8px' }}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                    </svg>
                    Signing In...
                  </>
                ) : 'Access Inventory Dashboard'}
              </button>
            </form>

            {/* Demo Credentials */}
            <div style={{ marginTop: '16px' }}>
              <button onClick={() => setShowDemo(v => !v)} style={{
                width: '100%', height: '46px', background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
                color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem', fontWeight: 700,
                letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background 0.2s',
              }}>
                DEMO CREDENTIALS {showDemo ? '▲' : '▼'}
              </button>
              {showDemo && (
                <div style={{
                  marginTop: '10px', background: CARD_BG2,
                  border: '1px solid rgba(249,115,22,0.2)', borderRadius: '10px', padding: '14px 16px',
                }}>
                  {[['Username', 'admin'], ['Password', 'admin123']].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: label === 'Username' ? '8px' : 0 }}>
                      <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', minWidth: '72px' }}>{label}:</span>
                      <code style={{
                        background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)',
                        color: ORANGE, padding: '2px 10px', borderRadius: '6px',
                        fontFamily: 'Consolas,monospace', fontWeight: 700, fontSize: '0.88rem',
                      }}>{val}</code>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
