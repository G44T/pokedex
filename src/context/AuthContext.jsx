import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = loading
  const [caught, setCaught] = useState({})
  const [syncState, setSyncState] = useState('ok') // 'ok' | 'syncing'

  useEffect(() => {
    let unsubFirestore = null

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Set user IMMEDIATELY so the app never hangs on splash
        setUser(firebaseUser)
        setSyncState('syncing')

        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (snap.exists()) {
            setCaught(snap.data().caught || {})
          } else {
            // First login: migrate localStorage data
            const local = JSON.parse(localStorage.getItem('pkdx_caught') || '{}')
            setCaught(local)
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              caught: local,
              email: firebaseUser.email,
              name: firebaseUser.displayName || '',
            })
          }
        } catch (e) {
          console.error('Firestore load error:', e)
          // Fall back to localStorage — never block the app
          setCaught(JSON.parse(localStorage.getItem('pkdx_caught') || '{}'))
        }
        setSyncState('ok')

        // Real-time listener
        if (unsubFirestore) unsubFirestore()
        try {
          unsubFirestore = onSnapshot(doc(db, 'users', firebaseUser.uid), (snap) => {
            if (snap.exists()) setCaught(snap.data().caught || {})
          }, (err) => console.error('Snapshot error:', err))
        } catch (e) {
          console.error('Snapshot setup error:', e)
        }
      } else {
        if (unsubFirestore) { unsubFirestore(); unsubFirestore = null }
        setCaught({})
        setUser(null)
      }
    }, (error) => {
      // onAuthStateChanged itself can error if Firebase is misconfigured
      console.error('Auth state error:', error)
      setUser(null)
    })

    return () => {
      unsubAuth()
      if (unsubFirestore) unsubFirestore()
    }
  }, [])

  async function saveCaught(newCaught) {
    localStorage.setItem('pkdx_caught', JSON.stringify(newCaught))
    setCaught(newCaught)
    if (!user) return
    setSyncState('syncing')
    try {
      await setDoc(doc(db, 'users', user.uid), { caught: newCaught }, { merge: true })
    } catch (e) {
      console.error('Sync error:', e)
    }
    setSyncState('ok')
  }

  async function login(email, password) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function register(name, email, password) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: name })
  }

  async function logout() {
    await signOut(auth)
  }

  async function resetPassword(email) {
    await sendPasswordResetEmail(auth, email)
  }

  return (
    <AuthContext.Provider value={{ user, caught, saveCaught, syncState, login, register, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
