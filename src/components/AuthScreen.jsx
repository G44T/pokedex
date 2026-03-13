import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './AuthScreen.module.css'

const AUTH_ERRORS = {
  'auth/user-not-found':          'No existe cuenta con ese email.',
  'auth/wrong-password':          'Contraseña incorrecta.',
  'auth/invalid-email':           'Email inválido.',
  'auth/too-many-requests':       'Demasiados intentos. Espera un momento.',
  'auth/invalid-credential':      'Email o contraseña incorrectos.',
  'auth/email-already-in-use':    'Ya existe una cuenta con ese email.',
  'auth/weak-password':           'La contraseña es demasiado débil.',
  'auth/configuration-not-found': '⚠️ Firebase no configurado. Reemplaza TU_API_KEY en src/firebase.js',
  'auth/api-key-not-valid':       '⚠️ API Key inválida. Revisa src/firebase.js',
  'auth/network-request-failed':  'Error de red. Verifica tu conexión.',
}

export default function AuthScreen() {
  const { login, register, resetPassword } = useAuth()
  const [tab, setTab] = useState('login')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPw, setLoginPw] = useState('')

  // Register fields
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPw, setRegPw] = useState('')
  const [regPw2, setRegPw2] = useState('')

  function clearMessages() { setError(''); setSuccess('') }

  async function handleLogin(e) {
    e.preventDefault()
    if (!loginEmail || !loginPw) return setError('Por favor completa todos los campos.')
    clearMessages(); setLoading(true)
    try {
      await login(loginEmail, loginPw)
    } catch (err) {
      console.error(err.code, err.message)
      setError(AUTH_ERRORS[err.code] || `Error: ${err.code}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    if (!regName || !regEmail || !regPw) return setError('Por favor completa todos los campos.')
    if (regPw !== regPw2) return setError('Las contraseñas no coinciden.')
    if (regPw.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.')
    clearMessages(); setLoading(true)
    try {
      await register(regName, regEmail, regPw)
    } catch (err) {
      console.error(err.code, err.message)
      setError(AUTH_ERRORS[err.code] || `Error: ${err.code}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleReset() {
    if (!loginEmail) return setError('Ingresa tu email primero.')
    clearMessages()
    try {
      await resetPassword(loginEmail)
      setSuccess('✅ Enviamos un link de recuperación a tu email.')
    } catch {
      setError('Error al enviar email. Verifica que sea correcto.')
    }
  }

  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.ball} />
          <h1>POKé<span>DEX</span></h1>
          <p>TU COLECCIÓN EN LA NUBE</p>
        </div>

        {(error || success) && (
          <div className={`${styles.message} ${success ? styles.msgSuccess : styles.msgError}`}>
            {error || success}
          </div>
        )}

        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn} ${tab === 'login' ? styles.tabActive : ''}`}
            onClick={() => { setTab('login'); clearMessages() }}
          >Iniciar sesión</button>
          <button
            className={`${styles.tabBtn} ${tab === 'register' ? styles.tabActive : ''}`}
            onClick={() => { setTab('register'); clearMessages() }}
          >Registrarse</button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className={styles.field}>
              <label>EMAIL</label>
              <input
                className={styles.input}
                type="email"
                placeholder="entrenador@pokemon.com"
                autoComplete="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label>CONTRASEÑA</label>
              <input
                className={styles.input}
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={loginPw}
                onChange={e => setLoginPw(e.target.value)}
              />
            </div>
            <div className={styles.forgot}>
              <button type="button" onClick={handleReset}>¿Olvidaste tu contraseña?</button>
            </div>
            <button className={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? 'CARGANDO...' : 'ENTRAR'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className={styles.field}>
              <label>NOMBRE DE ENTRENADOR</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Ash Ketchum"
                autoComplete="name"
                value={regName}
                onChange={e => setRegName(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label>EMAIL</label>
              <input
                className={styles.input}
                type="email"
                placeholder="entrenador@pokemon.com"
                autoComplete="email"
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label>CONTRASEÑA</label>
              <input
                className={styles.input}
                type="password"
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                value={regPw}
                onChange={e => setRegPw(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label>CONFIRMAR CONTRASEÑA</label>
              <input
                className={styles.input}
                type="password"
                placeholder="Repite la contraseña"
                autoComplete="new-password"
                value={regPw2}
                onChange={e => setRegPw2(e.target.value)}
              />
            </div>
            <button className={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? 'CARGANDO...' : 'CREAR CUENTA'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
