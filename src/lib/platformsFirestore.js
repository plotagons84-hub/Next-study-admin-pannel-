// Real, shared-across-all-visitors backend for the admin panel's "Links"
// (lock/unlock, edit URLs), "Announce" (site-wide banner), and "Control"
// (feature toggles) tabs - all stored in Firestore, all live via onSnapshot,
// so a change the admin makes shows up for every visitor within seconds,
// no refresh needed.
import { doc, collection, setDoc, updateDoc, onSnapshot, increment, serverTimestamp, getDocs } from 'firebase/firestore'
import { db } from './firebase'
import { platforms as basePlatforms, pwPlatforms as basePw, nextTopperPlatforms as baseNt } from '../data/constants'

const platformsDocRef = doc(db, 'config', 'platforms')
const announcementDocRef = doc(db, 'config', 'announcement')
const appControlDocRef = doc(db, 'config', 'appControl')
const countersDocRef = doc(db, 'stats', 'counters')

function logSnapshotError(label) {
  return (err) => console.error(`[platformsFirestore] ${label} subscription failed:`, err)
}

// --- Platform lock state / edited links ------------------------------------

function mergeList(baseList, overrides) {
  return baseList.map((item) => ({ ...item, ...(overrides?.[item.id] || {}) }))
}

// Matches the exact "is this card locked?" rule PlatformCard.jsx uses: an
// explicit `locked: true`, OR a link-kind card with no href yet (freshly
// added platforms with an empty URL should never look clickable).
export function isLocked(item) {
  return !!item.locked || (item.kind === 'link' && !item.href && !item.url)
}

// Public-site-only display order: every unlocked ("LIVE") card first, then
// every locked/"Coming Soon" card after, so the two never sit mixed
// together in the list. Order *within* each group is left untouched.
export function sortForDisplay(list) {
  const unlocked = list.filter((item) => !isLocked(item))
  const locked = list.filter((item) => isLocked(item))
  return [...unlocked, ...locked]
}

// Public site never shows a card that's been hidden from the admin panel -
// not even for a moment. Admin panel passes includeHidden:true so it can
// still see (and un-hide) hidden cards.
function visibleOnly(list, includeHidden) {
  return includeHidden ? list : list.filter((item) => !item.hidden)
}

// `options.includeHidden` - the admin panel needs to see every card
// (including hidden ones) to manage them; the public site does not, and
// must never render a hidden card at all, so it always filters here.
export function subscribePlatforms(callback, options = {}) {
  const { includeHidden = false } = options
  return onSnapshot(
    platformsDocRef,
    (snap) => {
      const overrides = snap.data()?.overrides || {}
      callback({
        platforms: visibleOnly(mergeList(basePlatforms, overrides), includeHidden),
        pwPlatforms: visibleOnly(mergeList(basePw, overrides), includeHidden),
        nextTopperPlatforms: visibleOnly(mergeList(baseNt, overrides), includeHidden),
      })
    },
    (err) => {
      logSnapshotError('subscribePlatforms')(err)
      // Fall back to the base (unlocked-as-authored) lists so the site still works.
      callback({
        platforms: visibleOnly(basePlatforms, includeHidden),
        pwPlatforms: visibleOnly(basePw, includeHidden),
        nextTopperPlatforms: visibleOnly(baseNt, includeHidden),
      })
    }
  )
}

export async function setPlatformOverride(id, patch) {
  try {
    // Targeted write: only touches overrides.<id>, leaves every other
    // platform's override completely untouched.
    await updateDoc(platformsDocRef, { [`overrides.${id}`]: patch })
  } catch (err) {
    // Only reachable the very first time this document doesn't exist yet -
    // create it with just this one override, nothing wiped.
    if (err.code === 'not-found') {
      await setDoc(platformsDocRef, { overrides: { [id]: patch } }, { merge: true })
    } else {
      throw err
    }
  }
}

export async function resetPlatformOverride(id) {
  await updateDoc(platformsDocRef, { [`overrides.${id}`]: {} })
}

// --- Site-wide announcement banner ------------------------------------------

export function subscribeAnnouncement(callback) {
  return onSnapshot(
    announcementDocRef,
    (snap) => callback(snap.data() || { text: '', active: false, color: 'red' }),
    (err) => {
      logSnapshotError('subscribeAnnouncement')(err)
      callback({ text: '', active: false, color: 'red' })
    }
  )
}

export async function setAnnouncement({ text, active, color }) {
  await setDoc(announcementDocRef, { text, active, color }, { merge: true })
}

// --- App-wide feature toggles ------------------------------------------------

const DEFAULT_APP_CONTROL = {
  maintenanceMode: false,
  telegramPopupEnabled: true,
  urgentAlertEnabled: true,
  kukuTvEnabled: true,
}

export function subscribeAppControl(callback) {
  return onSnapshot(
    appControlDocRef,
    (snap) => callback(snap.data() || DEFAULT_APP_CONTROL),
    (err) => {
      logSnapshotError('subscribeAppControl')(err)
      callback(DEFAULT_APP_CONTROL)
    }
  )
}

export async function setAppControl(patch) {
  await setDoc(appControlDocRef, patch, { merge: true })
}

// --- Real "total opens" counter ---------------------------------------------

export async function recordAppOpen() {
  try {
    await setDoc(countersDocRef, { totalOpens: increment(1), lastOpenedAt: serverTimestamp() }, { merge: true })
  } catch (err) {
    console.error('[platformsFirestore] recordAppOpen failed:', err)
  }
}

export function subscribeCounters(callback) {
  return onSnapshot(
    countersDocRef,
    (snap) => callback(snap.data() || { totalOpens: 0 }),
    (err) => {
      logSnapshotError('subscribeCounters')(err)
      callback({ totalOpens: 0 })
    }
  )
}

// --- Lightweight "online now" presence --------------------------------------
// Each open tab writes a heartbeat every 20s; "online now" = presence docs
// updated in the last 60s. This is an approximation (no server-side cleanup
// of stale docs), not a precise number - good enough for a dashboard vibe.

export function startPresenceHeartbeat() {
  const sessionId = Math.random().toString(36).slice(2)
  const ref = doc(db, 'presence', sessionId)
  const beat = () =>
    setDoc(ref, { lastSeen: serverTimestamp() }).catch((err) =>
      console.error('[platformsFirestore] presence heartbeat failed:', err)
    )
  beat()
  const interval = setInterval(beat, 20000)
  return () => clearInterval(interval)
}

export function subscribePresenceCount(callback) {
  return onSnapshot(
    collection(db, 'presence'),
    (snap) => {
      const now = Date.now()
      const online = snap.docs.filter((d) => {
        const t = d.data().lastSeen?.toMillis?.()
        return t && now - t < 60000
      }).length
      callback(online)
    },
    (err) => {
      logSnapshotError('subscribePresenceCount')(err)
      callback(0)
    }
  )
}

// --- Unique-device tracking ("how many devices actually opened/unlocked
// the app" - a much better proxy for daily active users than raw page
// opens, which double-counts refreshes on the same phone). --------------
// Each browser gets one random ID stored in localStorage forever; every
// app open upserts that device's doc with a fresh lastSeen. Admin panel
// then counts distinct device docs, and how many were seen in the last
// 24h, to approximate "daily users".

const DEVICE_ID_KEY = 'ns_device_id'

export function getDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY)
    if (!id) {
      id =
        (crypto?.randomUUID && crypto.randomUUID()) ||
        `${Date.now()}-${Math.random().toString(36).slice(2)}`
      localStorage.setItem(DEVICE_ID_KEY, id)
    }
    return id
  } catch {
    // localStorage unavailable (private mode etc.) - fall back to a
    // per-session id so the call below still works, just won't dedupe.
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`
  }
}

export async function recordDeviceOpen() {
  try {
    const id = getDeviceId()
    const ref = doc(db, 'devices', id)
    // merge:true so an existing device doc just gets its lastSeen bumped,
    // and a first-time device gets created with both fields.
    await setDoc(ref, { lastSeen: serverTimestamp() }, { merge: true })
  } catch (err) {
    console.error('[platformsFirestore] recordDeviceOpen failed:', err)
  }
}

// One-shot read (not a live subscription) since this is a stat that only
// needs to refresh when the admin dashboard tab is viewed/re-mounted.
export async function fetchDeviceStats() {
  try {
    const snap = await getDocs(collection(db, 'devices'))
    const now = Date.now()
    let activeToday = 0
    snap.forEach((d) => {
      const t = d.data().lastSeen?.toMillis?.()
      if (t && now - t < 24 * 60 * 60 * 1000) activeToday += 1
    })
    return { totalDevices: snap.size, activeToday }
  } catch (err) {
    console.error('[platformsFirestore] fetchDeviceStats failed:', err)
    return { totalDevices: 0, activeToday: 0 }
  }
}
