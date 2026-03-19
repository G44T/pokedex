import { createContext, useContext, useEffect, useState } from 'react'
import {
  doc, getDoc, setDoc, updateDoc, collection,
  query, where, getDocs, onSnapshot
} from 'firebase/firestore'
import { db } from '../firebase'

// ─── Simple hash (SHA-256 via Web Crypto API) ─────────────────────────────────
// Passwords are NEVER stored in plain text — only their SHA-256 hash.
async function hashPassword(password) {
  const encoded = new TextEncoder().encode(password)
  const buffer  = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// ─── Session storage (localStorage) ──────────────────────────────────────────
const SESSION_KEY = 'pkdx_session'

function saveSession(userId, username) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId, username }))
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(undefined)  // undefined = initializing
  const [caught, setCaught]       = useState({})
  const [syncState, setSyncState] = useState('ok')
  const [unsubSnap, setUnsubSnap] = useState(null)

  // On mount: restore session from localStorage
  useEffect(() => {
    const session = loadSession()
    if (!session) { setUser(null); return }

    // Verify user still exists in Firestore
    getDoc(doc(db, 'users', session.userId))
      .then(snap => {
        if (snap.exists()) {
          const data = snap.data()
          setUser({ id: session.userId, username: data.username })
          setCaught(data.caught || {})
          startSnapshot(session.userId)
        } else {
          clearSession()
          setUser(null)
        }
      })
      .catch(() => {
        // Firestore unreachable — restore from localStorage anyway
        setUser({ id: session.userId, username: session.username })
        setCaught(JSON.parse(localStorage.getItem('pkdx_caught') || '{}'))
      })
  }, [])

  function startSnapshot(userId) {
    const unsub = onSnapshot(
      doc(db, 'users', userId),
      snap => { if (snap.exists()) setCaught(snap.data().caught || {}) },
      err  => console.error('Snapshot error:', err)
    )
    setUnsubSnap(() => unsub)
    return unsub
  }

  // ── Register ────────────────────────────────────────────────
  async function register(username, password) {
    username = username.trim()
    if (!username || !password) throw new Error('Completa todos los campos.')
    if (username.length < 3)    throw new Error('El usuario debe tener al menos 3 caracteres.')
    if (password.length < 6)    throw new Error('La contraseña debe tener al menos 6 caracteres.')

    // Check username not taken (case-insensitive)
    const q = query(
      collection(db, 'users'),
      where('usernameLower', '==', username.toLowerCase())
    )
    const existing = await getDocs(q)
    if (!existing.empty) throw new Error('Ese nombre de usuario ya está en uso.')

    const passwordHash = await hashPassword(password)
    const userId       = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    // Migrate any existing local caught data
    const localCaught = JSON.parse(localStorage.getItem('pkdx_caught') || '{}')

    await setDoc(doc(db, 'users', userId), {
      username,
      usernameLower: username.toLowerCase(),
      passwordHash,
      caught:    localCaught,
      createdAt: new Date().toISOString(),
    })

    setUser({ id: userId, username })
    setCaught(localCaught)
    saveSession(userId, username)
    startSnapshot(userId)
  }

  // ── Login ───────────────────────────────────────────────────
  async function login(username, password) {
    username = username.trim()
    if (!username || !password) throw new Error('Completa todos los campos.')

    const q = query(
      collection(db, 'users'),
      where('usernameLower', '==', username.toLowerCase())
    )
    const snap = await getDocs(q)
    if (snap.empty) throw new Error('Usuario no encontrado.')

    const userDoc  = snap.docs[0]
    const data     = userDoc.data()
    const inputHash = await hashPassword(password)

    if (inputHash !== data.passwordHash) throw new Error('Contraseña incorrecta.')

    const userId = userDoc.id
    setUser({ id: userId, username: data.username })
    setCaught(data.caught || {})
    saveSession(userId, data.username)
    startSnapshot(userId)
  }

  // ── Logout ──────────────────────────────────────────────────
  function logout() {
    if (unsubSnap) unsubSnap()
    setUnsubSnap(null)
    setUser(null)
    setCaught({})
    clearSession()
  }

  // ── Save caught ─────────────────────────────────────────────
  async function saveCaught(newCaught) {
    localStorage.setItem('pkdx_caught', JSON.stringify(newCaught))
    setCaught(newCaught)
    if (!user) return
    setSyncState('syncing')
    try {
      await updateDoc(doc(db, 'users', user.id), { caught: newCaught })
    } catch (e) {
      console.error('Sync error:', e)
    } finally {
      setSyncState('ok')
    }
  }

  return (
    <AuthContext.Provider value={{ user, caught, saveCaught, syncState, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
