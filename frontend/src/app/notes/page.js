'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { API_URL } from '../lib/api'
import { Plus, Search, StickyNote, Trash2, Bell, FileText, X, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Calendar, Clock } from 'lucide-react'

// ── DateTime Picker Modal (desktop only) ─────────────────────────────────────
function DateTimeModal({ value, onChange, onClose }) {
  const now = new Date()

  const parseValue = () => {
    if (value) {
      const d = new Date(value)
      return {
        year: d.getFullYear(),
        month: d.getMonth(),
        day: d.getDate(),
        hour: d.getHours(),
        minute: d.getMinutes(),
      }
    }
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
    }
  }

  const [sel, setSel] = useState(parseValue)
  const [view, setView] = useState('calendar')

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  const daysInMonth = new Date(sel.year, sel.month + 1, 0).getDate()
  const firstDay = new Date(sel.year, sel.month, 1).getDay()

  // Build a datetime-local string "YYYY-MM-DDTHH:MM" from local parts
  const toLocalString = (y, mo, d, h, mi) => {
    const pad = n => String(n).padStart(2, '0')
    return `${y}-${pad(mo + 1)}-${pad(d)}T${pad(h)}:${pad(mi)}`
  }

  const handleConfirm = () => {
    // Build local date string and pass it up — parent will convert to ISO when submitting
    onChange(toLocalString(sel.year, sel.month, sel.day, sel.hour, sel.minute))
    onClose()
  }

  const prevMonth = () => {
    setSel(s => s.month === 0 ? { ...s, month: 11, year: s.year - 1 } : { ...s, month: s.month - 1 })
  }

  const nextMonth = () => {
    setSel(s => s.month === 11 ? { ...s, month: 0, year: s.year + 1 } : { ...s, month: s.month + 1 })
  }

  const isToday = (d) => d === now.getDate() && sel.month === now.getMonth() && sel.year === now.getFullYear()
  const isSelected = (d) => d === sel.day

  return (
    <div className="fixed inset-0 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 999 }}>
      <div className="bg-[#111] border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-base">Set Reminder</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition"><X size={18} /></button>
        </div>

        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setView('calendar')}
            className={"flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition " + (view === 'calendar' ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white')}
          >
            <Calendar size={14} /> Date
          </button>
          <button
            onClick={() => setView('time')}
            className={"flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition " + (view === 'time' ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white')}
          >
            <Clock size={14} /> Time
          </button>
        </div>

        {view === 'calendar' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition text-lg">‹</button>
              <p className="font-bold text-sm">{MONTHS[sel.month]} {sel.year}</p>
              <button onClick={nextMonth} className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition text-lg">›</button>
            </div>
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map(d => <div key={d} className="text-center text-xs text-gray-600 font-medium py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-y-1 mb-5">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d = i + 1
                return (
                  <button
                    key={d}
                    onClick={() => setSel(s => ({ ...s, day: d }))}
                    className={"w-full aspect-square rounded-lg text-xs font-medium transition flex items-center justify-center " + (
                      isSelected(d) ? 'bg-orange-500 text-white'
                        : isToday(d) ? 'border border-orange-500/50 text-orange-400'
                        : 'hover:bg-white/10 text-gray-300'
                    )}
                  >
                    {d}
                  </button>
                )
              })}
            </div>
          </>
        )}

        {view === 'time' && (
          <div className="flex items-center justify-center gap-6 py-6 mb-5">
            <div className="flex flex-col items-center gap-2">
              <button onClick={() => setSel(s => ({ ...s, hour: (s.hour + 1) % 24 }))} className="w-9 h-9 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition text-lg">▲</button>
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
                <span className="text-2xl font-bold">{String(sel.hour).padStart(2,'0')}</span>
              </div>
              <button onClick={() => setSel(s => ({ ...s, hour: (s.hour + 23) % 24 }))} className="w-9 h-9 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition text-lg">▼</button>
              <p className="text-xs text-gray-600">Hour</p>
            </div>
            <span className="text-2xl font-bold text-gray-500 mt-1">:</span>
            <div className="flex flex-col items-center gap-2">
              <button onClick={() => setSel(s => ({ ...s, minute: (s.minute + 1) % 60 }))} className="w-9 h-9 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition text-lg">▲</button>
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
                <span className="text-2xl font-bold">{String(sel.minute).padStart(2,'0')}</span>
              </div>
              <button onClick={() => setSel(s => ({ ...s, minute: (s.minute + 59) % 60 }))} className="w-9 h-9 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition text-lg">▼</button>
              <p className="text-xs text-gray-600">Minute</p>
            </div>
          </div>
        )}

        <div className="bg-white/5 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2">
          <Calendar size={13} className="text-orange-400 flex-shrink-0" />
          <p className="text-sm font-medium">{MONTHS[sel.month]} {sel.day}, {sel.year}</p>
          <span className="text-gray-600 mx-1">·</span>
          <Clock size={13} className="text-orange-400 flex-shrink-0" />
          <p className="text-sm font-medium">{String(sel.hour).padStart(2,'0')}:{String(sel.minute).padStart(2,'0')}</p>
        </div>

        <button
          onClick={handleConfirm}
          className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 rounded-2xl transition text-sm"
        >
          Confirm Date & Time
        </button>
      </div>
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────────────────

export default function Notes() {
  const router = useRouter()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [showDateModal, setShowDateModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '', content: '', type: 'quick', reminderDate: ''
  })

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null

  useEffect(() => {
    if (!user || !token) { router.push('/login'); return }
    fetchNotes()
  }, [search, filterType])

  const fetchNotes = async () => {
    try {
      const cached = localStorage.getItem('cached_notes')
      if (cached && !search && !filterType) {
        setNotes(JSON.parse(cached))
        setLoading(false)
      }
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (filterType) params.append('type', filterType)
      const response = await fetch(`${API_URL}/api/notes?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setNotes(data)
      if (!search && !filterType) {
        localStorage.setItem('cached_notes', JSON.stringify(data))
      }
    } catch (err) {
      console.log('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setPosting(true)
    setError(null)
    try {
      let reminderDate = ''
      if (formData.reminderDate) {
        // THE FIX: datetime-local gives "2026-03-22T14:30"
        // We parse it as LOCAL time and convert to UTC ISO for the backend
        // This means if you pick 2:30 PM in Nigeria (UTC+1),
        // it sends 1:30 PM UTC to the backend — exactly right
        const local = new Date(formData.reminderDate)
        reminderDate = local.toISOString()
      }

      const response = await fetch(`${API_URL}/api/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...formData, reminderDate })
      })
      const data = await response.json()
      if (!response.ok) { setError(data.message); return }
      setMessage('Note saved!')
      setFormData({ title: '', content: '', type: 'quick', reminderDate: '' })
      setShowForm(false)
      localStorage.removeItem('cached_notes')
      fetchNotes()
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setError('Failed to save note')
    } finally {
      setPosting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this note?')) return
    try {
      await fetch(`${API_URL}/api/notes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const updated = notes.filter(n => n._id !== id)
      setNotes(updated)
      localStorage.setItem('cached_notes', JSON.stringify(updated))
    } catch (err) { console.log('Failed to delete') }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const isOverdue = (date) => new Date(date) < new Date()

  const formatReminderDisplay = (val) => {
    if (!val) return null
    const d = new Date(val)
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const hour = d.getHours()
    const minute = d.getMinutes()
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const h = hour % 12 || 12
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} · ${h}:${String(minute).padStart(2,'0')} ${ampm}`
  }

  return (
    <div>
      {showDateModal && (
        <DateTimeModal
          value={formData.reminderDate}
          onChange={(val) => setFormData({ ...formData, reminderDate: val })}
          onClose={() => setShowDateModal(false)}
        />
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <StickyNote size={22} className="text-orange-400" />
            Notes
          </h1>
          <p className="text-gray-600 text-sm mt-1">{notes.length} saved</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-4 py-2.5 rounded-xl transition text-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:block">New Note</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <div className="flex-1 min-w-0 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full bg-[#0e0e0e] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-orange-500/50 text-sm transition"
          />
        </div>
        <div className="flex gap-1.5">
          {['', 'quick', 'reminder'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={"px-3 py-2.5 rounded-xl text-xs font-medium transition " + (filterType === type ? 'bg-orange-500 text-white' : 'bg-[#0e0e0e] border border-white/10 text-gray-400')}
            >
              {type === '' ? 'All' : type === 'quick' ? 'Quick' : 'Reminders'}
            </button>
          ))}
        </div>
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
            <h2 className="font-bold text-sm uppercase tracking-widest text-gray-400">New Note</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-600 hover:text-white transition">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-gray-500 text-xs uppercase tracking-widest mb-2 block">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Note title"
                required
                className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50 text-sm transition"
              />
            </div>
            <div>
              <label className="text-gray-500 text-xs uppercase tracking-widest mb-2 block">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your note here..."
                required
                rows={4}
                className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50 text-sm transition resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'quick', reminderDate: '' })}
                className={"flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition flex-1 justify-center " + (formData.type === 'quick' ? 'bg-orange-500 text-white' : 'bg-[#080808] border border-white/10 text-gray-400')}
              >
                <FileText size={14} />
                Quick
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'reminder' })}
                className={"flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition flex-1 justify-center " + (formData.type === 'reminder' ? 'bg-orange-500 text-white' : 'bg-[#080808] border border-white/10 text-gray-400')}
              >
                <Bell size={14} />
                Reminder
              </button>
            </div>
            {formData.type === 'reminder' && (
              <div>
                <label className="text-gray-500 text-xs uppercase tracking-widest mb-2 block">Date and Time</label>

                {/* MOBILE: native datetime input */}
                <input
                  type="datetime-local"
                  value={formData.reminderDate}
                  onChange={(e) => setFormData({ ...formData, reminderDate: e.target.value })}
                  required
                  className="sm:hidden w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50 text-sm transition"
                />

                {/* DESKTOP: beautiful custom picker */}
                <button
                  type="button"
                  onClick={() => setShowDateModal(true)}
                  className="hidden sm:flex w-full items-center gap-3 bg-[#080808] border border-white/10 hover:border-orange-500/50 rounded-xl px-4 py-3 text-sm transition text-left"
                >
                  <Calendar size={15} className="text-orange-400 flex-shrink-0" />
                  {formData.reminderDate
                    ? <span className="text-white font-medium">{formatReminderDisplay(formData.reminderDate)}</span>
                    : <span className="text-gray-500">Click to choose date and time...</span>
                  }
                </button>

                <input type="hidden" value={formData.reminderDate} required={formData.type === 'reminder'} />
              </div>
            )}
            <button
              type="submit"
              disabled={posting || (formData.type === 'reminder' && !formData.reminderDate)}
              className="bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 text-sm"
            >
              {posting ? 'Saving...' : 'Save Note'}
            </button>
          </form>
        </div>
      )}

      {loading && notes.length === 0 && <p className="text-gray-600 text-sm animate-pulse">Loading notes...</p>}

      {!loading && notes.length === 0 && (
        <div className="text-center py-20">
          <StickyNote size={40} className="text-gray-800 mx-auto mb-4" />
          <p className="text-gray-600 text-sm">No notes yet</p>
        </div>
      )}

      {/* DESKTOP */}
      <div className="hidden sm:grid grid-cols-2 gap-3">
        {notes.map(note => (
          <div
            key={note._id}
            className="bg-[#0e0e0e] border border-white/5 hover:border-white/10 rounded-2xl p-5 transition cursor-pointer"
            onClick={() => setExpandedId(expandedId === note._id ? null : note._id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {note.type === 'reminder'
                  ? <Bell size={14} className={note.reminderSent ? 'text-gray-600' : isOverdue(note.reminderDate) ? 'text-red-400' : 'text-orange-400'} />
                  : <FileText size={14} className="text-gray-600" />
                }
                <p className="font-medium text-sm truncate">{note.title}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(note._id) }}
                className="w-7 h-7 bg-red-500/10 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/20 transition flex-shrink-0 ml-2"
              >
                <Trash2 size={13} />
              </button>
            </div>
            <p className={"text-gray-500 text-xs leading-relaxed " + (expandedId === note._id ? '' : 'line-clamp-2')}>
              {note.content}
            </p>
            {note.type === 'reminder' && note.reminderDate && (
              <div className={"mt-3 flex items-center gap-1.5 text-xs " + (note.reminderSent ? 'text-gray-600' : isOverdue(note.reminderDate) ? 'text-red-400' : 'text-orange-400')}>
                <Bell size={11} />
                {note.reminderSent ? 'Reminder sent' : formatDate(note.reminderDate)}
              </div>
            )}
            <p className="text-gray-700 text-xs mt-3">{formatDate(note.createdAt)}</p>
          </div>
        ))}
      </div>

      {/* MOBILE */}
      <div className="sm:hidden flex flex-col gap-2">
        {notes.map(note => (
          <div key={note._id} className="bg-[#0e0e0e] border border-white/5 rounded-xl overflow-hidden">
            <div
              className="flex items-center justify-between px-4 py-3.5 cursor-pointer"
              onClick={() => setExpandedId(expandedId === note._id ? null : note._id)}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {note.type === 'reminder'
                  ? <Bell size={14} className={note.reminderSent ? 'text-gray-600' : isOverdue(note.reminderDate) ? 'text-red-400' : 'text-orange-400'} />
                  : <FileText size={14} className="text-gray-500" />
                }
                <p className="font-medium text-sm truncate">{note.title}</p>
              </div>
              <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(note._id) }}
                  className="w-7 h-7 bg-red-500/10 rounded-lg flex items-center justify-center text-red-400"
                >
                  <Trash2 size={12} />
                </button>
                {expandedId === note._id
                  ? <ChevronUp size={14} className="text-gray-600" />
                  : <ChevronDown size={14} className="text-gray-600" />
                }
              </div>
            </div>
            {expandedId === note._id && (
              <div className="px-4 pb-4 border-t border-white/5 pt-3">
                <p className="text-gray-400 text-sm leading-relaxed">{note.content}</p>
                {note.type === 'reminder' && note.reminderDate && (
                  <div className={"mt-3 flex items-center gap-1.5 text-xs " + (note.reminderSent ? 'text-gray-600' : isOverdue(note.reminderDate) ? 'text-red-400' : 'text-orange-400')}>
                    <Bell size={11} />
                    {note.reminderSent ? 'Reminder sent' : formatDate(note.reminderDate)}
                  </div>
                )}
                <p className="text-gray-700 text-xs mt-2">{formatDate(note.createdAt)}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}