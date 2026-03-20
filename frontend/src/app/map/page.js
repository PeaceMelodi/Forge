'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Navigation, AlertCircle, Loader, X, ArrowDown, LocateFixed } from 'lucide-react'

export default function MapPage() {
  const router = useRouter()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const userMarkerRef = useRef(null)
  const destMarkerRef = useRef(null)
  const routeLayerRef = useRef(null)
  const originTimeoutRef = useRef(null)
  const destTimeoutRef = useRef(null)

  const [showModal, setShowModal] = useState(true)
  const [userCountry, setUserCountry] = useState('')

  const [originQuery, setOriginQuery] = useState('')
  const [originSuggestions, setOriginSuggestions] = useState([])
  const [originSuggestLoading, setOriginSuggestLoading] = useState(false)
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false)
  const [selectedOrigin, setSelectedOrigin] = useState(null)
  const [originLoading, setOriginLoading] = useState(false)

  const [destQuery, setDestQuery] = useState('')
  const [destSuggestions, setDestSuggestions] = useState([])
  const [destSuggestLoading, setDestSuggestLoading] = useState(false)
  const [showDestSuggestions, setShowDestSuggestions] = useState(false)
  const [selectedDest, setSelectedDest] = useState(null)
  const [destLoading, setDestLoading] = useState(false)

  const [locating, setLocating] = useState(false)
  const [error, setError] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [mapReady, setMapReady] = useState(false)

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  useEffect(() => {
    if (!user || !token) { router.push('/login'); return }
    initMap()
  }, [])

  const normalize = (result) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon ?? result.lng)
    const name = result.name || result.display_name?.split(',')[0] || ''
    return { lat, lng, name, display_name: result.display_name }
  }

  const calcDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  const getDistLabel = (lat2, lng2) => {
    if (!userLocation || isNaN(lat2) || isNaN(lng2)) return null
    const d = calcDistance(userLocation.lat, userLocation.lng, lat2, lng2)
    if (isNaN(d)) return null
    return d < 1 ? `${(d * 1000).toFixed(0)}m away` : `${d.toFixed(1)}km away`
  }

  const getDistanceVerdict = (km) => {
    if (km < 0.5) return {
      emoji: '🚶',
      label: 'Just around the corner',
      description: 'This is extremely close. You can probably walk there in a few minutes.',
      color: '#22c55e',
      bg: 'rgba(34,197,94,0.08)',
      border: 'rgba(34,197,94,0.2)',
    }
    if (km < 2) return {
      emoji: '🛵',
      label: 'Very close by',
      description: 'A short walk or a quick bike ride and you are there.',
      color: '#86efac',
      bg: 'rgba(134,239,172,0.08)',
      border: 'rgba(134,239,172,0.2)',
    }
    if (km < 10) return {
      emoji: '🚗',
      label: 'Not too far',
      description: 'A quick drive and you will be there in no time.',
      color: '#f97316',
      bg: 'rgba(249,115,22,0.08)',
      border: 'rgba(249,115,22,0.2)',
    }
    if (km < 50) return {
      emoji: '🛣️',
      label: 'Moderate distance',
      description: 'You are still within the same general area. A comfortable drive.',
      color: '#fb923c',
      bg: 'rgba(251,146,60,0.08)',
      border: 'rgba(251,146,60,0.2)',
    }
    if (km < 200) return {
      emoji: '🗺️',
      label: 'Quite a distance',
      description: 'This is a decent trip. You might want to plan ahead and fuel up.',
      color: '#facc15',
      bg: 'rgba(250,204,21,0.08)',
      border: 'rgba(250,204,21,0.2)',
    }
    if (km < 500) return {
      emoji: '✈️',
      label: 'Far away',
      description: 'This is a long journey. Consider traveling by air or planning an overnight stop.',
      color: '#f87171',
      bg: 'rgba(248,113,113,0.08)',
      border: 'rgba(248,113,113,0.2)',
    }
    return {
      emoji: '🌍',
      label: 'Very far away',
      description: 'This destination is in a completely different region. Definitely plan your travel carefully.',
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.08)',
      border: 'rgba(239,68,68,0.2)',
    }
  }

  const fetchSuggestions = async (query, bias) => {
    let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`
    if (bias) {
      const d = 2
      url += `&viewbox=${bias.lng - d},${bias.lat + d},${bias.lng + d},${bias.lat - d}&bounded=0`
    }
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
    const data = await res.json()
    const normalized = data.map(normalize).filter(r => !isNaN(r.lat) && !isNaN(r.lng))
    if (bias) {
      normalized.sort((a, b) =>
        calcDistance(bias.lat, bias.lng, a.lat, a.lng) -
        calcDistance(bias.lat, bias.lng, b.lat, b.lng)
      )
    }
    return normalized
  }

  // Origin live suggestions
  useEffect(() => {
    if (originQuery.trim().length < 2) { setOriginSuggestions([]); setShowOriginSuggestions(false); return }
    if (originTimeoutRef.current) clearTimeout(originTimeoutRef.current)
    originTimeoutRef.current = setTimeout(async () => {
      setOriginSuggestLoading(true)
      try {
        const data = await fetchSuggestions(originQuery, userLocation)
        setOriginSuggestions(data)
        setShowOriginSuggestions(data.length > 0)
      } catch {}
      finally { setOriginSuggestLoading(false) }
    }, 400)
    return () => clearTimeout(originTimeoutRef.current)
  }, [originQuery])

  // Destination live suggestions
  useEffect(() => {
    if (destQuery.trim().length < 2) { setDestSuggestions([]); setShowDestSuggestions(false); return }
    if (destTimeoutRef.current) clearTimeout(destTimeoutRef.current)
    destTimeoutRef.current = setTimeout(async () => {
      setDestSuggestLoading(true)
      try {
        const bias = selectedOrigin || userLocation
        const data = await fetchSuggestions(destQuery, bias)
        setDestSuggestions(data)
        setShowDestSuggestions(data.length > 0)
      } catch {}
      finally { setDestSuggestLoading(false) }
    }, 400)
    return () => clearTimeout(destTimeoutRef.current)
  }, [destQuery])

  const initMap = async () => {
    if (typeof window === 'undefined') return
    const L = (await import('leaflet')).default
    await import('leaflet/dist/leaflet.css')
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
    if (mapInstanceRef.current) return
    const map = L.map(mapRef.current, { center: [9.0820, 8.6753], zoom: 6, zoomControl: true })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors', maxZoom: 20
    }).addTo(map)
    mapInstanceRef.current = map
    setMapReady(true)
  }

  const handleAllowLocation = () => {
    setShowModal(false)
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        setUserLocation({ lat: latitude, lng: longitude })
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          )
          const data = await res.json()
          const country = data.address?.country || ''
          setUserCountry(country)
        } catch {}
        setLocating(false)
      },
      () => { setLocating(false) },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    )
  }

  const handleDenyLocation = () => { setShowModal(false) }

  const placeOriginOnMap = async (result) => {
    const { lat, lng, name } = result
    if (isNaN(lat) || isNaN(lng)) { setError('Could not find coordinates. Try again.'); return }
    const L = (await import('leaflet')).default
    const map = mapInstanceRef.current
    if (!map) return
    if (userMarkerRef.current) userMarkerRef.current.remove()
    if (routeLayerRef.current) routeLayerRef.current.remove()
    const icon = L.divIcon({
      html: `<div style="width:18px;height:18px;background:#f97316;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px #f9731640,0 2px 8px #0004;"></div>`,
      className: '', iconSize: [18, 18], iconAnchor: [9, 9],
    })
    userMarkerRef.current = L.marker([lat, lng], { icon })
      .addTo(map).bindPopup(`<b style="color:#f97316">📍 ${name}</b>`).openPopup()
    map.setView([lat, lng], 14)
    setSelectedOrigin(result)
    if (selectedDest) drawRoute(result, selectedDest)
  }

  const placeDestOnMap = async (result) => {
    const { lat, lng, name } = result
    if (isNaN(lat) || isNaN(lng)) { setError('Could not find coordinates. Try again.'); return }
    const L = (await import('leaflet')).default
    const map = mapInstanceRef.current
    if (!map) return
    if (destMarkerRef.current) destMarkerRef.current.remove()
    if (routeLayerRef.current) routeLayerRef.current.remove()
    const destIcon = L.divIcon({
      html: `<div style="width:24px;height:24px;background:#3b82f6;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 10px #0006;"></div>`,
      className: '', iconSize: [24, 24], iconAnchor: [12, 24],
    })
    destMarkerRef.current = L.marker([lat, lng], { icon: destIcon })
      .addTo(map).bindPopup(`<b style="color:#3b82f6">${name}</b>`).openPopup()
    map.setView([lat, lng], 14)
    setSelectedDest(result)
    const origin = selectedOrigin || (userLocation ? { lat: userLocation.lat, lng: userLocation.lng, name: userCountry || 'Your Location' } : null)
    if (origin) drawRoute(origin, result)
  }

  const drawRoute = async (origin, dest) => {
    const L = (await import('leaflet')).default
    const map = mapInstanceRef.current
    if (!map) return
    if (routeLayerRef.current) routeLayerRef.current.remove()
    routeLayerRef.current = L.polyline(
      [[origin.lat, origin.lng], [dest.lat, dest.lng]],
      { color: '#f97316', weight: 4, opacity: 0.9, dashArray: '10, 8' }
    ).addTo(map)
    const bounds = L.latLngBounds([[origin.lat, origin.lng], [dest.lat, dest.lng]])
    map.fitBounds(bounds, { padding: [80, 80] })
    const dist = calcDistance(origin.lat, origin.lng, dest.lat, dest.lng)
    const verdict = getDistanceVerdict(dist)
    setRouteInfo({
      from: origin.name,
      to: dest.name,
      distance: dist < 1 ? `${(dist * 1000).toFixed(0)}m` : `${dist.toFixed(1)}km`,
      verdict,
    })
  }

  const handleOriginSearch = async (e) => {
    e.preventDefault()
    if (!originQuery.trim()) return
    setError(null)
    setShowOriginSuggestions(false)
    if (selectedOrigin && selectedOrigin.name === originQuery) { await placeOriginOnMap(selectedOrigin); return }
    setOriginLoading(true)
    try {
      const data = await fetchSuggestions(originQuery, userLocation)
      if (data.length === 0) { setError('Starting location not found.'); return }
      await placeOriginOnMap(data[0])
    } catch { setError('Search failed. Try again.') }
    finally { setOriginLoading(false) }
  }

  const handleDestSearch = async (e) => {
    e.preventDefault()
    if (!destQuery.trim()) return
    setError(null)
    setShowDestSuggestions(false)
    if (selectedDest && selectedDest.name === destQuery) { await placeDestOnMap(selectedDest); return }
    setDestLoading(true)
    try {
      const bias = selectedOrigin || userLocation
      const data = await fetchSuggestions(destQuery, bias)
      if (data.length === 0) { setError('Destination not found.'); return }
      await placeDestOnMap(data[0])
    } catch { setError('Search failed. Try again.') }
    finally { setDestLoading(false) }
  }

  const handleClearAll = async () => {
    const map = mapInstanceRef.current
    if (userMarkerRef.current) userMarkerRef.current.remove()
    if (destMarkerRef.current) destMarkerRef.current.remove()
    if (routeLayerRef.current) routeLayerRef.current.remove()
    setSelectedOrigin(null); setOriginQuery(''); setOriginSuggestions([]); setShowOriginSuggestions(false)
    setSelectedDest(null); setDestQuery(''); setDestSuggestions([]); setShowDestSuggestions(false)
    setRouteInfo(null); setError(null)
    if (map) map.setView([9.0820, 8.6753], 6)
  }

  return (
    <div className="w-full">

      {/* MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', zIndex: 999 }}
        >
          <div className="bg-[#111111] border border-white/10 rounded-3xl p-8 w-full max-w-sm shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-5">
              <LocateFixed size={28} className="text-orange-400" />
            </div>
            <h2 className="text-xl font-bold text-center mb-2">Allow Location Access</h2>
            <p className="text-gray-500 text-sm text-center leading-relaxed mb-8">
              Forge would like to know your general location to show you relevant results. We will only detect your country, not your exact position.
            </p>
            <button
              onClick={handleAllowLocation}
              className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-3.5 rounded-2xl transition text-sm flex items-center justify-center gap-2 mb-3"
            >
              <LocateFixed size={16} />
              Yes, allow location
            </button>
            <button
              onClick={handleDenyLocation}
              className="w-full bg-white/5 hover:bg-white/10 text-gray-400 font-bold py-3.5 rounded-2xl transition text-sm"
            >
              No thanks, I will search manually
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MapPin size={22} className="text-orange-400" />
          Map Finder
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          {locating
            ? 'Detecting your location...'
            : userCountry
              ? `You are in ${userCountry}. Search for any place.`
              : 'Search for any place anywhere.'}
        </p>
      </div>

      {/* Distance Verdict Card */}
      {routeInfo && routeInfo.verdict && (
        <div
          className="rounded-2xl px-5 py-4 mb-4 border"
          style={{ background: routeInfo.verdict.bg, borderColor: routeInfo.verdict.border }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <span className="text-2xl flex-shrink-0">{routeInfo.verdict.emoji}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-bold text-sm" style={{ color: routeInfo.verdict.color }}>
                    {routeInfo.verdict.label}
                  </p>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: routeInfo.verdict.border, color: routeInfo.verdict.color }}>
                    {routeInfo.distance}
                  </span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">{routeInfo.verdict.description}</p>
                <p className="text-gray-600 text-xs mt-1.5 truncate">{routeInfo.from} → {routeInfo.to}</p>
              </div>
            </div>
            <button onClick={handleClearAll} className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition flex-shrink-0">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Both inputs in one card */}
      <div className="bg-[#0e0e0e] border border-white/10 rounded-2xl p-4 mb-4 flex flex-col gap-3">

        {/* Origin input */}
        <div className="relative">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-orange-500 border-2 border-white shadow" style={{ zIndex: 1 }} />
              <input
                type="text"
                value={originQuery}
                onChange={(e) => { setOriginQuery(e.target.value); setSelectedOrigin(null) }}
                onFocus={() => originSuggestions.length > 0 && setShowOriginSuggestions(true)}
                placeholder="Starting point..."
                className="w-full bg-[#080808] border border-white/10 rounded-xl pl-8 pr-8 py-2.5 focus:outline-none focus:border-orange-500/50 text-sm transition"
                autoComplete="off"
              />
              {originSuggestLoading
                ? <Loader size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 animate-spin" />
                : originQuery
                  ? <button type="button" onClick={() => { setOriginQuery(''); setSelectedOrigin(null); setOriginSuggestions([]); setShowOriginSuggestions(false) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition"><X size={12} /></button>
                  : null
              }
            </div>
            <button
              onClick={handleOriginSearch}
              disabled={originLoading || !originQuery.trim()}
              className="bg-orange-500 hover:bg-orange-400 text-white px-4 py-2.5 rounded-xl transition disabled:opacity-50 text-sm flex items-center gap-1.5 flex-shrink-0"
            >
              {originLoading ? <Loader size={14} className="animate-spin" /> : <Search size={14} />}
              <span className="hidden sm:block text-xs font-bold">Go</span>
            </button>
          </div>
          {showOriginSuggestions && originSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-[#111] border border-white/15 rounded-xl overflow-hidden shadow-2xl" style={{ zIndex: 50, top: '100%' }}>
              {originSuggestions.map((result, i) => (
                <div
                  key={i}
                  onMouseDown={(e) => { e.preventDefault(); setOriginQuery(result.name); setSelectedOrigin(result); setShowOriginSuggestions(false); setOriginSuggestions([]) }}
                  className="flex items-start gap-3 px-4 py-2.5 cursor-pointer hover:bg-white/5 transition border-b border-white/5 last:border-0"
                >
                  <MapPin size={12} className="text-orange-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-white truncate">{result.name}</p>
                    <p className="text-gray-600 text-xs truncate">{result.display_name}</p>
                    {getDistLabel(result.lat, result.lng) && <p className="text-orange-400 text-xs font-medium">{getDistLabel(result.lat, result.lng)}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Arrow */}
        <div className="flex items-center gap-2 px-1">
          <div className="h-px flex-1 bg-white/5" />
          <ArrowDown size={12} className="text-gray-700 flex-shrink-0" />
          <div className="h-px flex-1 bg-white/5" />
        </div>

        {/* Destination input */}
        <div className="relative">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white shadow" style={{ zIndex: 1 }} />
              <input
                type="text"
                value={destQuery}
                onChange={(e) => { setDestQuery(e.target.value); setSelectedDest(null) }}
                onFocus={() => destSuggestions.length > 0 && setShowDestSuggestions(true)}
                placeholder="Destination..."
                className="w-full bg-[#080808] border border-white/10 rounded-xl pl-8 pr-8 py-2.5 focus:outline-none focus:border-blue-500/50 text-sm transition"
                autoComplete="off"
              />
              {destSuggestLoading
                ? <Loader size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 animate-spin" />
                : destQuery
                  ? <button type="button" onClick={() => { setDestQuery(''); setSelectedDest(null); setDestSuggestions([]); setShowDestSuggestions(false) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition"><X size={12} /></button>
                  : null
              }
            </div>
            <button
              onClick={handleDestSearch}
              disabled={destLoading || !destQuery.trim()}
              className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2.5 rounded-xl transition disabled:opacity-50 text-sm flex items-center gap-1.5 flex-shrink-0"
            >
              {destLoading ? <Loader size={14} className="animate-spin" /> : <Search size={14} />}
              <span className="hidden sm:block text-xs font-bold">Go</span>
            </button>
          </div>
          {showDestSuggestions && destSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-[#111] border border-white/15 rounded-xl overflow-hidden shadow-2xl" style={{ zIndex: 50, top: '100%' }}>
              {destSuggestions.map((result, i) => (
                <div
                  key={i}
                  onMouseDown={(e) => { e.preventDefault(); setDestQuery(result.name); setSelectedDest(result); setShowDestSuggestions(false); setDestSuggestions([]) }}
                  className="flex items-start gap-3 px-4 py-2.5 cursor-pointer hover:bg-white/5 transition border-b border-white/5 last:border-0"
                >
                  <MapPin size={12} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-white truncate">{result.name}</p>
                    <p className="text-gray-600 text-xs truncate">{result.display_name}</p>
                    {getDistLabel(result.lat, result.lng) && <p className="text-orange-400 text-xs font-medium">{getDistLabel(result.lat, result.lng)}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
          <AlertCircle size={16} />{error}
          <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Map */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10" style={{ height: '460px', zIndex: 0 }}>
        {locating && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/95">
            <div className="flex flex-col items-center gap-3">
              <Loader size={24} className="text-orange-400 animate-spin" />
              <p className="text-gray-600 text-sm font-medium">Detecting your location...</p>
            </div>
          </div>
        )}
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        {mapReady && (
          <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-4 shadow-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-orange-500 border-2 border-white shadow" />
              <span className="text-xs text-gray-700 font-medium">Start</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow" />
              <span className="text-xs text-gray-700 font-medium">End</span>
            </div>
            {routeInfo && (
              <div className="flex items-center gap-1.5">
                <div style={{ width: '16px', borderTop: '2px dashed #f97316' }} />
                <span className="text-xs text-gray-700 font-medium">Route</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}