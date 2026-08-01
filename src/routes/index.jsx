import { useEffect, useState } from 'react'
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { onAdminAuthChanged, signOutAdmin, subscribeOwnAdminStatus } from '../lib/adminAuth'
import { subscribePresenceCount } from '../lib/platformsFirestore'
import AdminSplash from '../components/admin/AdminSplash'
import AdminLogin from '../components/admin/AdminLogin'
import AdminAccessGranted from '../components/admin/AdminAccessGranted'
import AdminShell from '../components/admin/AdminShell'
import AdminOverview from '../components/admin/AdminOverview'
import AdminControl from '../components/admin/AdminControl'
import AdminLinks from '../components/admin/AdminLinks'
import AdminButtons from '../components/admin/AdminButtons'
import AdminAnnounce from '../components/admin/AdminAnnounce'
import AdminAITutor from '../components/admin/AdminAITutor'

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: AdminApp,
})

// stage: 'splash' -> 'login' -> 'granted' -> 'panel'
function AdminApp() {
  const [stage, setStage] = useState('splash')
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [tab, setTab] = useState('stats')
  const [onlineCount, setOnlineCount] = useState(0)
  const [revokedMessage, setRevokedMessage] = useState('')

  useEffect(() => {
    const unsub = onAdminAuthChanged((u) => {
      setUser(u)
      setAuthChecked(true)
      if (u && stage === 'splash') setStage('panel') // already logged in this session
    })
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => subscribePresenceCount(setOnlineCount), [])

  // If another admin revokes this account, this fires within moments and
  // signs them out immediately - even mid-session, even on another device.
  useEffect(() => {
    if (!user) return
    return subscribeOwnAdminStatus(user.uid, (data) => {
      if (data?.revoked) {
        setRevokedMessage('Your admin access has been revoked.')
        signOutAdmin()
        setStage('splash')
      }
    })
  }, [user])

  if (!authChecked) return null

  if (stage === 'splash') {
    return (
      <AdminSplash onEnter={() => setStage(user ? 'panel' : 'login')} revokedMessage={revokedMessage} />
    )
  }

  if (stage === 'login') {
    return <AdminLogin onSuccess={() => setStage('granted')} />
  }

  if (stage === 'granted') {
    return <AdminAccessGranted name={user?.displayName} onDone={() => setStage('panel')} />
  }

  return (
    <AdminShell
      activeTab={tab}
      onTabChange={setTab}
      onlineCount={onlineCount}
      onLogout={() => {
        signOutAdmin()
        setStage('splash')
      }}
    >
      {tab === 'stats' && <AdminOverview />}
      {tab === 'control' && <AdminControl />}
      {tab === 'links' && <AdminLinks />}
      {tab === 'buttons' && <AdminButtons />}
      {tab === 'announce' && <AdminAnnounce />}
      {tab === 'ai-chat' && <AdminAITutor />}
    </AdminShell>
  )
}
