'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Code2, StickyNote, Link2, Map, LogOut, Menu, X, Flame } from 'lucide-react'

const navItems = [
  { href: '/snippets', label: 'Snippets', icon: Code2 },
  { href: '/notes', label: 'Notes', icon: StickyNote },
  { href: '/links', label: 'Links', icon: Link2 },
  { href: '/map', label: 'Map', icon: Map },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) setUser(JSON.parse(storedUser))
    else setUser(null)
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setMobileOpen(false)
    router.push('/login')
  }

  if (!user) return null

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-[#0e0e0e] border-r border-white/5 px-4 py-6 fixed left-0 top-0">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Flame size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">Forge</span>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={"flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition group " + (isActive ? 'bg-orange-500/10 text-orange-400' : 'text-gray-500 hover:text-white hover:bg-white/5')}
              >
                <Icon size={17} className={isActive ? 'text-orange-400' : 'text-gray-600 group-hover:text-white transition'} />
                {label}
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400" />}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-white/5 pt-4 mt-4">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 text-xs font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-gray-600 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-red-400 transition text-sm w-full rounded-lg hover:bg-white/5"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#080808] border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
            <Flame size={13} className="text-white" />
          </div>
          <span className="font-bold tracking-tight">Forge</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-gray-400 hover:text-white transition"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* MOBILE FULLSCREEN MENU */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#080808] flex flex-col overflow-hidden">

          {/* Menu Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Flame size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">Forge</span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Info */}
          <div className="px-6 py-5 border-b border-white/5 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 text-lg font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold">{user.name}</p>
                <p className="text-gray-500 text-sm">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Scrollable Nav Items */}
          <nav className="flex flex-col px-4 py-4 gap-2 flex-1 overflow-y-auto">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={"flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-medium transition " + (isActive ? 'bg-orange-500/10 text-orange-400' : 'text-gray-400 hover:text-white hover:bg-white/5')}
                >
                  <div className={"w-10 h-10 rounded-xl flex items-center justify-center " + (isActive ? 'bg-orange-500/20' : 'bg-white/5')}>
                    <Icon size={20} className={isActive ? 'text-orange-400' : 'text-gray-500'} />
                  </div>
                  {label}
                  {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-orange-400" />}
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="px-4 py-6 border-t border-white/5 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-medium text-gray-500 hover:text-red-400 hover:bg-red-400/5 transition w-full"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <LogOut size={20} className="text-gray-500" />
              </div>
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  )
}