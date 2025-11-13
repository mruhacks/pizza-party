import { useState, useEffect } from "react";
import { MapPin, Star, Flame, DollarSign, Search, AlertCircle } from "lucide-react";

interface PizzaShop {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance: number;
}

export function SearchPage() {
  const [shops, setShops] = useState<PizzaShop[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sqlError, setSqlError] = useState("");
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          // Default to U of C coordinates if geolocation fails
          setLocation({
            latitude: 51.1304,
            longitude: -114.1267,
          });
        }
      );
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSqlError("");
    setLoading(true);

    try {
      const lat = location?.latitude || 51.0447;
      const lng = location?.longitude || -114.0719;
      const response = await fetch(
        `/api/search/pizzas?q=${encodeURIComponent(searchQuery)}&lat=${lat}&lng=${lng}`
      );
      const data = await response.json();

      if (!response.ok) {
        setSqlError(data.sqlError || data.error);
        setShops([]);
      } else {
        setShops(data.results || []);
      }
    } catch (error) {
      setSqlError(error instanceof Error ? error.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Find Pizza Near You</h1>
          </div>

          <form onSubmit={handleSearch} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-purple-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for pizza shops... (e.g., 'Vendome' or try: ' OR 1=1;--)"
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:bg-white/10 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search"}
            </button>

            {location && (
              <p className="text-purple-300 text-sm">
                📍 Searching from: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </p>
            )}
          </form>

          {sqlError && (
            <div className="mt-4 backdrop-blur-xl bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-red-200 text-sm">
                <p className="font-semibold mb-1">SQL Error Detected!</p>
                <code className="block bg-red-950/50 p-2 rounded text-xs overflow-x-auto">{sqlError}</code>
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center py-16">
            <div className="inline-block w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white/60 mt-4">Finding pizzerias...</p>
          </div>
        )}

        {!loading && shops.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="group backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl overflow-hidden hover:border-purple-400/50 hover:from-white/15 hover:to-white/10 transition-all duration-300 shadow-lg hover:shadow-purple-500/20"
              >
                <div className="relative h-40 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <div className="text-center">
                    <Flame className="w-12 h-12 text-white mx-auto mb-2" />
                    <p className="text-white/80 text-sm font-medium">{shop.name}</p>
                  </div>
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-pink-500 px-3 py-1 rounded-full text-white text-xs font-bold">
                    {shop.distance.toFixed(1)} km
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-2">{shop.name}</h3>
                  <p className="text-purple-300 text-sm mb-4 break-words">{shop.address}</p>

                  <div className="flex gap-2 mb-4 pb-4 border-b border-white/10">
                    <MapPin className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
                    <div className="text-white/70 text-xs">
                      <p>Lat: {shop.lat.toFixed(4)}</p>
                      <p>Lng: {shop.lng.toFixed(4)}</p>
                    </div>
                  </div>

                  <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && shops.length === 0 && !sqlError && (
          <div className="text-center py-16">
            <p className="text-white/60">Try searching for a pizza shop like "Vendome" or "Pizzerias"</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
