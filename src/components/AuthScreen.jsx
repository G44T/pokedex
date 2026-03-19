import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './AuthScreen.module.css'

export default function AuthScreen() {
  const { login, register } = useAuth()
  const [tab, setTab]       = useState('login')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  // Login fields
  const [loginUser, setLoginUser] = useState('')
  const [loginPw,   setLoginPw]   = useState('')

  // Register fields
  const [regUser,  setRegUser]  = useState('')
  const [regPw,    setRegPw]    = useState('')
  const [regPw2,   setRegPw2]   = useState('')

  function switchTab(t) { setTab(t); setError('') }

  async function handleLogin(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await login(loginUser, loginPw)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    if (regPw !== regPw2) return setError('Las contraseñas no coinciden.')
    setError(''); setLoading(true)
    try {
      await register(regUser, regPw)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.screen}>
      <div className={styles.card}>

        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.ball} />
          <h1>POKé<span>DEX</span></h1>
          <p>TU COLECCIÓN EN LA NUBE</p>
        </div>

        {/* Error */}
        {error && <div className={styles.message}>{error}</div>}

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn} ${tab === 'login' ? styles.tabActive : ''}`}
            onClick={() => switchTab('login')}
          >Iniciar sesión</button>
          <button
            className={`${styles.tabBtn} ${tab === 'register' ? styles.tabActive : ''}`}
            onClick={() => switchTab('register')}
          >Registrarse</button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className={styles.field}>
              <label>USUARIO</label>
              <input
                className={styles.input}
                type="text"
                placeholder="AshKetchum"
                autoComplete="username"
                value={loginUser}
                onChange={e => setLoginUser(e.target.value)}
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
            <button className={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? 'VERIFICANDO...' : 'ENTRAR'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className={styles.field}>
              <label>NOMBRE DE ENTRENADOR</label>
              <input
                className={styles.input}
                type="text"
                placeholder="AshKetchum"
                autoComplete="username"
                value={regUser}
                onChange={e => setRegUser(e.target.value)}
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
              {loading ? 'CREANDO CUENTA...' : 'CREAR CUENTA'}
            </button>
          </form>
        )}

        <p className={styles.hint}>
          {tab === 'login'
            ? '¿No tienes cuenta? Regístrate arriba.'
            : 'El usuario es único. La contraseña se guarda cifrada.'}
        </p>
      </div>
    </div>
  )
}
