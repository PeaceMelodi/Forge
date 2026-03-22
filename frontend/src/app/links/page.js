'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { API_URL } from '../lib/api'
import { Plus, Search, Link2, Trash2, ExternalLink, AlertCircle, CheckCircle, X, ChevronDown, ChevronUp } from 'lucide-react'

const CATEGORIES = ['documentation', 'tutorial', 'tool', 'article', 'other']

const getCategoryColor = (category) => {
  const colors = {
    documentation: 'text-blue-400 bg-blue-400/10',
    tutorial: 'text-green-400 bg-green-400/10',
    tool: 'text-orange-400 bg-orange-400/10',
    article: 'text-purple-400 bg-purple-400/10',
    other: 'text-gray-400 bg-gray-400/10'
  }
  return colors[category] || 'text-gray-400 bg-gray-400/10'
}

// ── Delete Confirmation Modal ─────────────────────────────────────────────────
function DeleteModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 999 }}>
      <div className="bg-[#111] border border-white/10 rounded-3xl p-7 w-full max-w-xs shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={20} className="text-red-400" />
        </div>
        <h2 className="font-bold text-base text-center mb-2">Delete Link</h2>
        <p className="text-gray-500 text-sm text-center mb-6 leading-relaxed">Are you sure you want to delete this link? This cannot be undone.</p>
        <button
          onClick={onConfirm}
          className="w-full bg-red-500 hover:bg-red-400 text-white font-bold py-3 rounded-2xl transition text-sm mb-2"
        >
          Yes, Delete
        </button>
        <button
          onClick={onCancel}
          className="w-full bg-white/5 hover:bg-white/10 text-gray-400 font-bold py-3 rounded-2xl transition text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────────────────

export default function Links() {
  const router = useRouter()
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [formData, setFormData] = useState({
    title: '', url: '', category: 'other', description: ''
  })

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null

  useEffect(() => {
    if (!user || !token) { router.push('/login'); return }
    fetchLinks()
  }, [search, filterCategory])

  const fetchLinks = async () => {
    try {
      const cached = localStorage.getItem('cached_links')
      if (cached && !search && !filterCategory) {
        setLinks(JSON.parse(cached))
        setLoading(false)
      }
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (filterCategory) params.append('category', filterCategory)
      const response = await fetch(`${API_URL}/api/links?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setLinks(data)
      if (!search && !filterCategory) {
        localStorage.setItem('cached_links', JSON.stringify(data))
      }
    } catch (err) {
      console.log('Failed to load links')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setPosting(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/api/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (!response.ok) { setError(data.message); return }
      setMessage('Link saved!')
      setFormData({ title: '', url: '', category: 'other', description: '' })
      setShowForm(false)
      localStorage.removeItem('cached_links')
      fetchLinks()
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setError('Failed to save link')
    } finally {
      setPosting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    try {
      await fetch(`${API_URL}/api/links/${deleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const updated = links.filter(l => l._id !== deleteId)
      setLinks(updated)
      localStorage.setItem('cached_links', JSON.stringify(updated))
    } catch (err) { console.log('Failed to delete') }
    finally { setDeleteId(null) }
  }

  const getDomain = (url) => {
    try { return new URL(url).hostname.replace('www.', '') }
    catch { return url }
  }

  return (
    <div>
      {/* Delete Confirmation Modal */}
      {deleteId && (
        <DeleteModal
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteId(null)}
        />
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Link2 size={22} className="text-orange-400" />
            Links
          </h1>
          <p className="text-gray-600 text-sm mt-1">{links.length} saved</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-4 py-2.5 rounded-xl transition text-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:block">Save Link</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 min-w-0 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search links..."
            className="w-full bg-[#0e0e0e] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-orange-500/50 text-sm transition"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-[#0e0e0e] border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500/50 text-sm transition text-gray-400 flex-shrink-0"
        >
          <option value="">All</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {message && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
          <CheckCircle size={16} />{message}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
          <AlertCircle size={16} />{error}
        </div>
      )}

      {showForm && (
        <div className="bg-[#0e0e0e] border border-white/10 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm uppercase tracking-widest text-gray-400">Save Link</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-600 hover:text-white transition">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-500 text-xs uppercase tracking-widest mb-2 block">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Next.js Docs"
                  required
                  className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50 text-sm transition"
                />
              </div>
              <div>
                <label className="text-gray-500 text-xs uppercase tracking-widest mb-2 block">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50 text-sm transition"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-gray-500 text-xs uppercase tracking-widest mb-2 block">URL</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://nextjs.org/docs"
                required
                className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50 text-sm transition"
              />
            </div>
            <div>
              <label className="text-gray-500 text-xs uppercase tracking-widest mb-2 block">Description (optional)</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Official Next.js documentation"
                className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50 text-sm transition"
              />
            </div>
            <button
              type="submit"
              disabled={posting}
              className="bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 text-sm"
            >
              {posting ? 'Saving...' : 'Save Link'}
            </button>
          </form>
        </div>
      )}

      {loading && links.length === 0 && <p className="text-gray-600 text-sm animate-pulse">Loading links...</p>}

      {!loading && links.length === 0 && (
        <div className="text-center py-20">
          <Link2 size={40} className="text-gray-800 mx-auto mb-4" />
          <p className="text-gray-600 text-sm">No links saved yet</p>
        </div>
      )}

      {/* DESKTOP */}
      <div className="hidden sm:grid grid-cols-2 gap-3">
        {links.map(link => (
          <div key={link._id} className="bg-[#0e0e0e] border border-white/5 hover:border-white/10 rounded-2xl p-5 transition">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 mr-3">
                <p className="font-medium text-sm mb-1 truncate">{link.title}</p>
                <p className="text-gray-600 text-xs truncate">{getDomain(link.url)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={"text-xs font-medium px-2.5 py-1 rounded-lg " + getCategoryColor(link.category)}>
                  {link.category}
                </span>
                <button
                  onClick={() => setDeleteId(link._id)}
                  className="w-7 h-7 bg-red-500/10 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/20 transition"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            {link.description && (
              <p className="text-gray-600 text-xs mb-3 line-clamp-2">{link.description}</p>
            )}
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-orange-400 hover:text-orange-300 transition text-xs font-medium"
            >
              <ExternalLink size={12} />
              Open Link
            </a>
          </div>
        ))}
      </div>

      {/* MOBILE */}
      <div className="sm:hidden flex flex-col gap-2">
        {links.map(link => (
          <div key={link._id} className="bg-[#0e0e0e] border border-white/5 rounded-xl overflow-hidden">
            <div
              className="flex items-center justify-between px-4 py-3.5 cursor-pointer"
              onClick={() => setExpandedId(expandedId === link._id ? null : link._id)}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className={"text-xs font-bold px-2 py-0.5 rounded-md flex-shrink-0 " + getCategoryColor(link.category)}>
                  {link.category.slice(0, 3).toUpperCase()}
                </span>
                <p className="font-medium text-sm truncate">{link.title}</p>
              </div>
              <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteId(link._id) }}
                  className="w-7 h-7 bg-red-500/10 rounded-lg flex items-center justify-center text-red-400"
                >
                  <Trash2 size={12} />
                </button>
                {expandedId === link._id
                  ? <ChevronUp size={14} className="text-gray-600" />
                  : <ChevronDown size={14} className="text-gray-600" />
                }
              </div>
            </div>
            {expandedId === link._id && (
              <div className="px-4 pb-4 border-t border-white/5 pt-3">
                <p className="text-gray-500 text-xs mb-1 truncate">{getDomain(link.url)}</p>
                {link.description && (
                  <p className="text-gray-600 text-xs mb-3">{link.description}</p>
                )}
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-orange-400 text-xs font-medium"
                >
                  <ExternalLink size={12} />
                  Open Link
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}