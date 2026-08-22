import { useEffect, useState } from 'react'
import { Download, Eye, Users, HeartPulse, Smartphone } from 'lucide-react'
import { ADMIN_BRAND } from '../../data/constants'
import {
  subscribeCounters,
  subscribePresenceCount,
  subscribeAppControl,
  subscribePlatforms,
  fetchDeviceStats,
} from '../../lib/platformsFirestore'
import { subscribeAdminsList } from '../../lib/adminAuth'

export default function AdminOverview() {
  const [totalOpens, setTotalOpens] = useState(0)
  const [onlineNow, setOnlineNow] = useState(0)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [lockedCount, setLockedCount] = useState(0)
  const [adminCount, setAdminCount] = useState(0)
  const [deviceStats, setDeviceStats] = useState({ totalDevices: 0, activeToday: 0 })

  useEffect(() => {
    const unsubs = [
      subscribeCounters((c) => setTotalOpens(c.totalOpens || 0)),
      subscribePresenceCount(setOnlineNow),
      subscribeAppControl((c) => setMaintenanceMode(!!c.maintenanceMode)),
      subscribePlatforms((data) => {
        const allLocked = data.platforms.filter((p) => p.locked).length
        setLockedCount(allLocked)
      }),
      subscribeAdminsList((list) => setAdminCount(list.length)),
    ]
    // Not a live subscription (see fetchDeviceStats) - just refresh it
    // every time this tab mounts, and again periodically while it's open.
    fetchDeviceStats().then(setDeviceStats)
    const deviceInterval = setInterval(() => fetchDeviceStats().then(setDeviceStats), 30000)
    return () => {
      unsubs.forEach((u) => u())
      clearInterval(deviceInterval)
    }
  }, [])

  const stats = [
    { label: 'Total Opens', value: totalOpens, icon: Eye },
    { label: 'Online Now', value: onlineNow, icon: Users },
    { label: 'Locked Cards', value: lockedCount, icon: Download },
    { label: 'Admins', value: adminCount, icon: HeartPulse },
    { label: 'Devices Unlocked Today', value: deviceStats.activeToday, icon: Smartphone },
    { label: 'Total Unique Devices', value: deviceStats.totalDevices, icon: Smartphone },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
          <BarIcon /> Live Analytics
        </h1>
        <p className="text-sm text-white/50 mt-1">Real numbers from Firestore &mdash; not a demo.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="glass rounded-xl2 p-4 sm:p-5">
            <div className="h-9 w-9 rounded-full bg-orange-500/10 border border-orange-500/30 grid place-items-center">
              <Icon size={16} className="text-orange-400" />
            </div>
            <p className="font-display text-2xl sm:text-3xl font-bold text-white mt-3">{value}</p>
            <p className="text-xs text-white/50 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl2 p-5">
        <h2 className="font-display font-semibold text-white flex items-center gap-2">System Health</h2>
        <div className="w-full h-2.5 rounded-full bg-white/10 mt-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              maintenanceMode ? 'w-1/4 bg-red-500' : 'w-full bg-emerald-500'
            }`}
          />
        </div>
        <div className="flex items-center justify-between mt-2.5 text-xs">
          <span className="text-white/50">
            {maintenanceMode ? 'Maintenance mode is ON' : 'All systems operational'}
          </span>
          <span className={maintenanceMode ? 'text-red-400 font-semibold' : 'text-emerald-400 font-semibold'}>
            {maintenanceMode ? '25%' : '100%'}
          </span>
        </div>
      </div>

      <p className="text-center text-xs text-white/30 pt-2">{ADMIN_BRAND.credit}</p>
    </div>
  )
}

function BarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-orange-400">
      <path d="M4 20V10M12 20V4M20 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
