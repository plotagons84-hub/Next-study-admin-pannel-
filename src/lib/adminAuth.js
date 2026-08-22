// Real multi-admin auth via Firebase Authentication.
//
// Firebase Auth's email/password provider needs an email, but the login
// screen only asks for a Name + Password (as requested) - so each name is
// turned into a synthetic, never-emailed address like
// "zishan.ahmad@admin.nextstudy.local" purely so Firebase has something
// email-shaped to key the account on. Nothing is ever sent to that address.
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp, collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { auth, db } from './firebase'

const EMAIL_DOMAIN = '@admin.nextstudy.local'

function nameToEmail(name) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
  return `${slug || 'admin'}${EMAIL_DOMAIN}`
}

async function upsertAdminRecord(user, name) {
  await setDoc(
    doc(db, 'admins', user.uid),
    { name, lastLogin: serverTimestamp() },
    { merge: true }
  )
}

// Creates a brand-new admin account. Use this once per real admin (e.g. once
// for "ZISHAN AHMAD" / ZISHANAHMAD2009) - after that they just log in.
export async function registerAdmin(name, password) {
  const email = nameToEmail(name)
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(user, { displayName: name })
  await upsertAdminRecord(user, name)
  return user
}

export async function signInAdmin(name, password) {
  const email = nameToEmail(name)
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  await upsertAdminRecord(user, user.displayName || name)
  return user
}

export function signOutAdmin() {
  return signOut(auth)
}

export function onAdminAuthChanged(callback) {
  return onAuthStateChanged(auth, callback)
}

// Realtime list of every admin who has ever logged in - only their name and
// last-login time are stored, nothing sensitive. Revoked admins are filtered
// out here (client-side, to avoid needing a composite Firestore index).
export function subscribeAdminsList(callback) {
  const q = query(collection(db, 'admins'), orderBy('lastLogin', 'desc'))
  return onSnapshot(q, (snap) => {
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(all.filter((a) => !a.revoked))
  })
}

// Marks an admin as revoked instead of deleting their Firestore record
// outright - keeps a trail, hides them from the visible list, and (paired
// with subscribeOwnAdminStatus below) forces them out of the panel within
// moments even if they're using it right now on another device. This does
// NOT delete their actual Firebase Auth account - that can't be done from
// client-side code for anyone but yourself (a real Firebase limitation, not
// a gap in this app) - see the README for how to fully remove someone via
// the Firebase console if that's ever needed.
export async function revokeAdmin(uid) {
  await setDoc(doc(db, 'admins', uid), { revoked: true }, { merge: true })
}

// Lets the currently-logged-in admin watch their OWN record live, so if
// someone else revokes them mid-session, the app can react immediately
// instead of waiting for their next page load.
export function subscribeOwnAdminStatus(uid, callback) {
  return onSnapshot(doc(db, 'admins', uid), (snap) => callback(snap.data()))
}
