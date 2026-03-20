'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { API_URL } from '../lib/api'
import { AlertCircle, Flame } from 'lucide-react'

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message)
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push('/snippets')

    } catch (err) {
      setError('Something went wrong, try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
            <Flame size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Forge</span>
        </div>

        <h1 className="text-3xl font-bold mb-1">Welcome back</h1>
        <p className="text-gray-600 text-sm mb-8">Sign in to your command hub</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-gray-500 text-xs uppercase tracking-widest mb-2 block">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
              required
              className="w-full bg-[#0e0e0e] border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:border-orange-500/50 text-sm transition"
            />
          </div>
          <div>
            <label className="text-gray-500 text-xs uppercase tracking-widest mb-2 block">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required
              className="w-full bg-[#0e0e0e] border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:border-orange-500/50 text-sm transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-400 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50 mt-2 text-sm"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-gray-600 text-sm text-center mt-6">
          No account?{' '}
          <Link href="/register" className="text-orange-400 hover:text-orange-300 transition">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}