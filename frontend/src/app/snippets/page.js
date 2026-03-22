'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { API_URL } from '../lib/api'
import { Plus, Search, Code2, Trash2, Tag, X, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

const LANGUAGES = ['javascript', 'typescript', 'python', 'css', 'html', 'sql', 'bash', 'json', 'jsx', 'tsx']

function tokenize(code) {
  const tokens = []
  let i = 0
  const keywords = new Set([
    'const','let','var','function','return','if','else','for','while','class',
    'import','export','default','from','async','await','new','try','catch',
    'throw','typeof','instanceof','in','of','switch','case','break','continue',
    'null','undefined','true','false','this','super','extends','static','get',
    'set','delete','void','yield','do','finally','with','debugger','type',
    'interface','enum','def','and','or','not','is','pass','lambda','print','self',
  ])
  const builtins = new Set([
    'console','Math','Array','Object','String','Number','Boolean','Promise',
    'JSON','Date','Error','Map','Set','parseInt','parseFloat','setTimeout',
    'setInterval','clearTimeout','clearInterval','fetch','require','module',
    'exports','process','window','document','localStorage','sessionStorage',
    'navigator','location','history','useState','useEffect','useRef',
    'useCallback','useMemo','useContext','React','ReactDOM','props','state',
    'render','length','push','pop','map','filter','reduce','forEach','find',
    'includes','indexOf','toString','valueOf','hasOwnProperty','keys','values',
    'entries','log','error','warn','info',
  ])
  while (i < code.length) {
    if (code[i] === '/' && code[i+1] === '/') {
      let j = i; while (j < code.length && code[j] !== '\n') j++
      tokens.push({ type: 'comment', value: code.slice(i, j) }); i = j; continue
    }
    if (code[i] === '/' && code[i+1] === '*') {
      let j = i+2; while (j < code.length && !(code[j]==='*'&&code[j+1]==='/')) j++
      j+=2; tokens.push({ type: 'comment', value: code.slice(i, j) }); i = j; continue
    }
    if (code[i] === '#') {
      let j = i; while (j < code.length && code[j] !== '\n') j++
      tokens.push({ type: 'comment', value: code.slice(i, j) }); i = j; continue
    }
    if (code[i] === '`') {
      let j = i+1; while (j < code.length && code[j] !== '`') { if (code[j]==='\\') j++; j++ }
      j++; tokens.push({ type: 'string', value: code.slice(i, j) }); i = j; continue
    }
    if (code[i] === '"') {
      let j = i+1; while (j < code.length && code[j] !== '"') { if (code[j]==='\\') j++; j++ }
      j++; tokens.push({ type: 'string', value: code.slice(i, j) }); i = j; continue
    }
    if (code[i] === "'") {
      let j = i+1; while (j < code.length && code[j] !== "'") { if (code[j]==='\\') j++; j++ }
      j++; tokens.push({ type: 'string', value: code.slice(i, j) }); i = j; continue
    }
    if (/[0-9]/.test(code[i]) || (code[i]==='.'&&/[0-9]/.test(code[i+1]))) {
      let j = i; while (j < code.length && /[0-9._xXa-fA-F]/.test(code[j])) j++
      tokens.push({ type: 'number', value: code.slice(i, j) }); i = j; continue
    }
    if (/[a-zA-Z_$]/.test(code[i])) {
      let j = i; while (j < code.length && /[a-zA-Z0-9_$]/.test(code[j])) j++
      const word = code.slice(i, j)
      let k = j; while (k < code.length && code[k]===' ') k++
      const isCall = code[k] === '('
      if (keywords.has(word)) tokens.push({ type: 'keyword', value: word })
      else if (builtins.has(word)) tokens.push({ type: 'builtin', value: word })
      else if (isCall) tokens.push({ type: 'function', value: word })
      else if (/^[A-Z]/.test(word)) tokens.push({ type: 'class', value: word })
      else tokens.push({ type: 'identifier', value: word })
      i = j; continue
    }
    if (/[+\-*/%=<>!&|^~?:;,.]/.test(code[i])) {
      tokens.push({ type: 'operator', value: code[i] }); i++; continue
    }
    if (/[{}()\[\]]/.test(code[i])) {
      tokens.push({ type: 'punctuation', value: code[i] }); i++; continue
    }
    tokens.push({ type: 'plain', value: code[i] }); i++
  }
  return tokens
}

function getTokenColor(type) {
  switch (type) {
    case 'keyword': return '#569cd6'
    case 'string': return '#ce9178'
    case 'comment': return '#6a9955'
    case 'number': return '#b5cea8'
    case 'function': return '#dcdcaa'
    case 'builtin': return '#9cdcfe'
    case 'class': return '#4ec9b0'
    case 'operator': return '#d4d4d4'
    case 'punctuation': return '#d4d4d4'
    case 'identifier': return '#9cdcfe'
    default: return '#d4d4d4'
  }
}

function MobileCodeBlock({ code }) {
  const [copied, setCopied] = useState(false)
  const lines = code.split('\n')

  const handleCopy = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ background: '#0a0a0a', borderRadius: '8px', overflow: 'hidden', width: '100%', position: 'relative' }}>
      <button
        onClick={handleCopy}
        style={{
          position: 'absolute', top: '6px', right: '6px', zIndex: 10,
          display: 'flex', alignItems: 'center', gap: '3px',
          background: copied ? '#6a995599' : '#ffffff18',
          border: 'none', borderRadius: '5px',
          color: copied ? '#b5cea8' : '#666',
          fontSize: '10px', padding: '3px 7px', cursor: 'pointer',
          fontFamily: 'monospace', backdropFilter: 'blur(4px)',
        }}
      >
        {copied ? <Check size={10} /> : <Copy size={10} />}
        {copied ? 'Copied!' : 'Copy'}
      </button>

      <div style={{ overflowY: 'auto', maxHeight: '280px', overflowX: 'hidden' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed' }}>
          <tbody>
            {lines.map((line, lineIndex) => {
              const tokens = tokenize(line)
              return (
                <tr key={lineIndex} style={{ lineHeight: '1.6' }}>
                  <td style={{
                    color: '#555', fontSize: '10px', fontFamily: 'monospace',
                    padding: '0 8px', userSelect: 'none', textAlign: 'right',
                    verticalAlign: 'top', width: '28px', minWidth: '28px',
                    background: '#0a0a0a',
                  }}>
                    {lineIndex + 1}
                  </td>
                  <td style={{
                    padding: '0 8px', fontFamily: 'monospace', fontSize: '11px',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    verticalAlign: 'top', background: '#0a0a0a',
                  }}>
                    {tokens.map((token, ti) => (
                      <span key={ti} style={{ color: getTokenColor(token.type) }}>
                        {token.value}
                      </span>
                    ))}
                    {line === '' && <span>&nbsp;</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Delete Confirmation Modal ─────────────────────────────────────────────────
function DeleteModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 999 }}>
      <div className="bg-[#111] border border-white/10 rounded-3xl p-7 w-full max-w-xs shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={20} className="text-red-400" />
        </div>
        <h2 className="font-bold text-base text-center mb-2">Delete Snippet</h2>
        <p className="text-gray-500 text-sm text-center mb-6 leading-relaxed">Are you sure you want to delete this snippet? This cannot be undone.</p>
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

export default function Snippets() {
  const router = useRouter()
  const [snippets, setSnippets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterLang, setFilterLang] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [posting, setPosting] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [formData, setFormData] = useState({
    title: '', code: '', language: 'javascript', tags: ''
  })

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null

  useEffect(() => {
    if (!user || !token) { router.push('/login'); return }
    fetchSnippets()
  }, [search, filterLang])

  const fetchSnippets = async () => {
    try {
      const cached = localStorage.getItem('cached_snippets')
      if (cached && !search && !filterLang) {
        setSnippets(JSON.parse(cached))
        setLoading(false)
      }
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (filterLang) params.append('language', filterLang)
      const response = await fetch(`${API_URL}/api/snippets?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setSnippets(data)
      if (!search && !filterLang) {
        localStorage.setItem('cached_snippets', JSON.stringify(data))
      }
    } catch (err) {
      console.log('Failed to load snippets')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setPosting(true)
    try {
      const response = await fetch(`${API_URL}/api/snippets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      })
      if (response.ok) {
        setFormData({ title: '', code: '', language: 'javascript', tags: '' })
        setShowForm(false)
        localStorage.removeItem('cached_snippets')
        fetchSnippets()
      }
    } catch (err) {
      console.log('Failed to save')
    } finally {
      setPosting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    try {
      await fetch(`${API_URL}/api/snippets/${deleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const updated = snippets.filter(s => s._id !== deleteId)
      setSnippets(updated)
      localStorage.setItem('cached_snippets', JSON.stringify(updated))
    } catch (err) { console.log('Failed to delete') }
    finally { setDeleteId(null) }
  }

  const handleCopyDesktop = (code, id) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getLangColor = (lang) => {
    const colors = {
      javascript: 'text-yellow-400 bg-yellow-400/10',
      typescript: 'text-blue-400 bg-blue-400/10',
      python: 'text-green-400 bg-green-400/10',
      css: 'text-pink-400 bg-pink-400/10',
      html: 'text-orange-400 bg-orange-400/10',
      sql: 'text-purple-400 bg-purple-400/10',
      bash: 'text-gray-400 bg-gray-400/10',
      json: 'text-cyan-400 bg-cyan-400/10',
      jsx: 'text-yellow-400 bg-yellow-400/10',
      tsx: 'text-blue-400 bg-blue-400/10',
    }
    return colors[lang] || 'text-gray-400 bg-gray-400/10'
  }

  return (
    <div className="w-full">
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
            <Code2 size={22} className="text-orange-400" />
            Snippets
          </h1>
          <p className="text-gray-600 text-sm mt-1">{snippets.length} saved</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-4 py-2.5 rounded-xl transition text-sm flex-shrink-0"
        >
          <Plus size={16} />
          <span className="hidden sm:block">New Snippet</span>
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
            placeholder="Search snippets..."
            className="w-full bg-[#0e0e0e] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-orange-500/50 text-sm transition"
          />
        </div>
        <select
          value={filterLang}
          onChange={(e) => setFilterLang(e.target.value)}
          className="bg-[#0e0e0e] border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500/50 text-sm transition text-gray-400 flex-shrink-0"
        >
          <option value="">All</option>
          {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="bg-[#0e0e0e] border border-white/10 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm uppercase tracking-widest text-gray-400">New Snippet</h2>
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
                  placeholder="Fetch with async await"
                  required
                  className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50 text-sm transition"
                />
              </div>
              <div>
                <label className="text-gray-500 text-xs uppercase tracking-widest mb-2 block">Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50 text-sm transition"
                >
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-gray-500 text-xs uppercase tracking-widest mb-2 block">Code</label>
              <textarea
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Paste your code here..."
                required
                rows={8}
                className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50 text-sm transition font-mono resize-none"
              />
            </div>
            <div>
              <label className="text-gray-500 text-xs uppercase tracking-widest mb-2 block">Tags (comma separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="fetch, async, api"
                className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50 text-sm transition"
              />
            </div>
            <button
              type="submit"
              disabled={posting}
              className="bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 text-sm"
            >
              {posting ? 'Saving...' : 'Save Snippet'}
            </button>
          </form>
        </div>
      )}

      {loading && snippets.length === 0 && <p className="text-gray-600 text-sm animate-pulse">Loading snippets...</p>}

      {!loading && snippets.length === 0 && (
        <div className="text-center py-20">
          <Code2 size={40} className="text-gray-800 mx-auto mb-4" />
          <p className="text-gray-600 text-sm">No snippets yet</p>
        </div>
      )}

      {/* DESKTOP */}
      <div className="hidden sm:flex flex-col gap-3">
        {snippets.map(snippet => (
          <div key={snippet._id} className="bg-[#0e0e0e] border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden transition">
            <div
              className="flex items-center justify-between px-5 py-4 cursor-pointer"
              onClick={() => setExpandedId(expandedId === snippet._id ? null : snippet._id)}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className={"text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0 " + getLangColor(snippet.language)}>
                  {snippet.language}
                </span>
                <p className="font-medium text-sm truncate">{snippet.title}</p>
              </div>
              <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                {snippet.tags?.length > 0 && (
                  <div className="flex items-center gap-1">
                    {snippet.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded-md">{tag}</span>
                    ))}
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleCopyDesktop(snippet.code, snippet._id) }}
                  className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition"
                >
                  {copiedId === snippet._id ? <Check size={13} /> : <Copy size={13} />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteId(snippet._id) }}
                  className="w-7 h-7 bg-red-500/10 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/20 transition"
                >
                  <Trash2 size={13} />
                </button>
                {expandedId === snippet._id ? <ChevronUp size={14} className="text-gray-600" /> : <ChevronDown size={14} className="text-gray-600" />}
              </div>
            </div>
            {expandedId === snippet._id && (
              <div className="border-t border-white/5">
                <SyntaxHighlighter
                  language={snippet.language}
                  style={vscDarkPlus}
                  customStyle={{ margin: 0, borderRadius: 0, background: '#0a0a0a', fontSize: '13px', padding: '20px' }}
                  showLineNumbers
                >
                  {snippet.code}
                </SyntaxHighlighter>
                {snippet.tags?.length > 0 && (
                  <div className="flex items-center gap-2 px-5 py-3 border-t border-white/5">
                    <Tag size={12} className="text-gray-700" />
                    {snippet.tags.map(tag => (
                      <span key={tag} className="text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded-md">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MOBILE */}
      <div className="sm:hidden flex flex-col gap-2 w-full">
        {snippets.map(snippet => (
          <div key={snippet._id} className="bg-[#0e0e0e] border border-white/5 rounded-xl w-full overflow-hidden">
            <div
              className="flex items-center justify-between px-3 py-3 cursor-pointer"
              onClick={() => setExpandedId(expandedId === snippet._id ? null : snippet._id)}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className={"text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 " + getLangColor(snippet.language)}>
                  {snippet.language.slice(0, 2).toUpperCase()}
                </span>
                <p className="font-medium text-sm truncate">{snippet.title}</p>
              </div>
              <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteId(snippet._id) }}
                  className="w-7 h-7 bg-red-500/10 rounded-lg flex items-center justify-center text-red-400"
                >
                  <Trash2 size={12} />
                </button>
                {expandedId === snippet._id
                  ? <ChevronUp size={13} className="text-gray-600" />
                  : <ChevronDown size={13} className="text-gray-600" />
                }
              </div>
            </div>
            {expandedId === snippet._id && (
              <div className="border-t border-white/5 px-3 pb-3 pt-2">
                <MobileCodeBlock code={snippet.code} />
                {snippet.tags?.length > 0 && (
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Tag size={11} className="text-gray-700 flex-shrink-0" />
                    {snippet.tags.map(tag => (
                      <span key={tag} className="text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded-md">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}