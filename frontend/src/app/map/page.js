'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Map, Navigation, MapPin, AlertCircle } from 'lucide-react'

export default function MapPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [userLocation, setUserLocation] = useState(null)

  const user = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('user') || 'null')
    : null

  const token = typeof window !== 'undefined'
    ? localStorage.getItem('token')
    : null

  useEffect(() => {
    if (!user || !token) {
      router.push('/login')
      return
    }
    getUserLocation()
  }, [])

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          })
        },
        (err) => console.log('Location error:', err)
      )
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    setResults([])
    setSelected(null)

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await response.json()
      if (data.length === 0) {
        setError('No results found for your search')
      } else {
        setResults(data)
      }
    } catch (err) {
      setError('Search failed, try again')
    } finally {
      setLoading(false)
    }
  }

  const getDirectionsUrl = (lat, lng) => {
    if (userLocation) {
      return `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${lat},${lng}`
    }
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  }

  const getDistance = (lat2, lng2) => {
    if (!userLocation) return null
    const R = 6371
    const dLat = (lat2 - userLocation.lat) * Math.PI / 180
    const dLng = (lng2 - userLocation.lng) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLocation.lat * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    return distance < 1
      ? `${(distance * 1000).toFixed(0)}m away`
      : `${distance.toFixed(1)}km away`
  }

  const getMapUrl = (lat, lng) => {
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`
  }

  const viewBtnClass = "flex items-center gap-1 bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-lg text-xs font-medium transition flex-1 justify-center"
  const dirBtnClass = "flex items-center gap-1 bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-lg text-xs font-medium transition flex-1 justify-center"

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Map size={22} className="text-orange-400" />
          Map Finder
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          {userLocation ? 'Location detected. Search for any place.' : 'Search for any place anywhere.'}
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a place, restaurant, street..."
            className="w-full bg-[#0e0e0e] border border-white/10 rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:border-orange-500/50 text-sm transition"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-3 rounded-xl transition disabled:opacity-50 text-sm flex items-center gap-2"
        >
          <Search size={15} />
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="flex flex-col gap-3 mb-8">
          <p className="text-gray-600 text-xs uppercase tracking-widest mb-1">{results.length} results found</p>
          {results.map((result, index) => {
            const isSelected = selected?.place_id === result.place_id
            const cardClass = isSelected
              ? 'bg-orange-500/5 border border-orange-500/50 rounded-2xl p-5 cursor-pointer transition'
              : 'bg-[#0e0e0e] border border-white/5 hover:border-white/10 rounded-2xl p-5 cursor-pointer transition'

            return (
              <div key={index} onClick={() => setSelected(result)} className={cardClass}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin size={14} className="text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm mb-0.5">
                      {result.name || result.display_name.split(',')[0]}
                    </p>
                    <p className="text-gray-600 text-xs line-clamp-2">{result.display_name}</p>
                    {userLocation && (
                      <p className="text-orange-400 text-xs mt-1.5 font-medium">
                        {getDistance(parseFloat(result.lat), parseFloat(result.lng))}
                      </p>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                    <a
                      href={getMapUrl(result.lat, result.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={viewBtnClass}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Map size={13} />
                      View on Map
                    </a>
                    <a
                      href={getDirectionsUrl(result.lat, result.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={dirBtnClass}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Navigation size={13} />
                      Get Directions
                    </a>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {results.length === 0 && !loading && !error && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
            <Map size={28} className="text-orange-400" />
          </div>
          <p className="text-gray-600 text-sm">Search for any place to get started</p>
          <p className="text-gray-700 text-xs mt-1">Restaurants, streets, landmarks, cities</p>
        </div>
      )}
    </div>
  )
}