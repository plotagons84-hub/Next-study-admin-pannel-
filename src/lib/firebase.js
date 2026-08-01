// Firebase is initialized ONCE here and imported by both the admin panel and
// the public site (they're the same app/codebase) - that's the whole
// "linking" step: there's nothing else to wire up separately.
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAEUp2BUwAUj3uoc1oLJT3xiXjfRq90wAs',
  authDomain: 'next-study-admin-pannel.firebaseapp.com',
  projectId: 'next-study-admin-pannel',
  storageBucket: 'next-study-admin-pannel.firebasestorage.app',
  messagingSenderId: '314417720512',
  appId: '1:314417720512:web:6d5ddde2cdeb722a41d125',
  measurementId: 'G-ELS3MZ80L5',
}

// getApps()/getApp() guards avoid a "Firebase app already exists" error if
// this module is ever evaluated more than once (e.g. hot reload in dev).
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)

// Analytics only works in a real browser with cookies/network, and throws in
// some sandboxed/dev environments - load it lazily and swallow failures.
export async function initAnalyticsIfSupported() {
  try {
    const { getAnalytics, isSupported } = await import('firebase/analytics')
    if (await isSupported()) return getAnalytics(firebaseApp)
  } catch {
    // analytics is optional - never let it break the app
  }
  return null
}
