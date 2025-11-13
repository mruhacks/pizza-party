import { useState, useEffect, useRef } from "react";
import { MapPin, Search, AlertCircle, Navigation, Star, Sparkles } from "lucide-react";
import { APIProvider, Map, Marker, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps";
import { GOOGLE_MAPS_API_KEY, DEFAULT_CENTER, DEFAULT_ZOOM } from "../config/maps";

interface PizzaShop {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance: number;
  photo_url?: string;
  avg_happiness?: number | null;
  avg_rizz?: number | null;
  avg_experience?: number | null;
  review_count?: number;
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
  const [selectedShop, setSelectedShop] = useState<PizzaShop | null>(null);
  const [hoveredShop, setHoveredShop] = useState<number | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Get current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(newLocation);
          // Load nearby shops automatically
          loadNearbyShops(newLocation.latitude, newLocation.longitude);
        },
        () => {
          // Default to U of C coordinates if geolocation fails
          const defaultLoc = { latitude: DEFAULT_CENTER.lat, longitude: DEFAULT_CENTER.lng };
          setLocation(defaultLoc);
          loadNearbyShops(defaultLoc.latitude, defaultLoc.longitude);
        }
      );
    }
  }, []);

  const loadNearbyShops = async (lat: number, lng: number) => {
    setLoading(true);
    setSqlError("");
    try {
      const response = await fetch(`/api/search/pizzas?q=&lat=${lat}&lng=${lng}`);
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSqlError("");
    setLoading(true);

    try {
      const lat = location?.latitude || DEFAULT_CENTER.lat;
      const lng = location?.longitude || DEFAULT_CENTER.lng;
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

  const handleShopClick = (shop: PizzaShop) => {
    setSelectedShop(shop);
    if (mapRef.current) {
      mapRef.current.panTo({ lat: shop.lat, lng: shop.lng });
      mapRef.current.setZoom(15);
    }
  };

  // Deep-link: when shops list updates, check for ?shopId=
  useEffect(() => {
    if (shops.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const shopIdParam = params.get("shopId");
    if (!shopIdParam) return;
    const idNum = parseInt(shopIdParam, 10);
    if (isNaN(idNum)) return;
    const found = shops.find(s => s.id === idNum);
    if (found) {
      setSelectedShop(found);
      if (mapRef.current) {
        mapRef.current.panTo({ lat: found.lat, lng: found.lng });
        mapRef.current.setZoom(15);
      }
    }
  }, [shops]);

  return (
    <div className="h-[calc(100vh-73px)] flex bg-slate-900">
      {/* Left sidebar with search and results */}
      <div className="w-96 flex-shrink-0 bg-slate-900 border-r border-white/10 flex flex-col">
        {/* Search bar in sidebar */}
        <div className="flex-shrink-0 p-4 border-b border-white/10">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-purple-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for pizza shops..."
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all"
              />
            </div>
          </form>

          {sqlError && (
            <div className="mt-3 bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-red-200 text-xs">
                <p className="font-semibold mb-1">SQL Error:</p>
                <code className="block bg-red-950/50 p-2 rounded overflow-x-auto">{sqlError}</code>
              </div>
            </div>
          )}
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white/60 mt-3 text-sm">Finding pizzerias...</p>
            </div>
          )}

          {!loading && shops.length === 0 && !sqlError && (
            <div className="p-8 text-center">
              <MapPin className="w-12 h-12 text-purple-400/50 mx-auto mb-3" />
              <p className="text-white/60 text-sm">
                {location ? "No pizza shops found nearby" : "Getting your location..."}
              </p>
            </div>
          )}

          {!loading && shops.length > 0 && (
            <div className="divide-y divide-white/10">
              {shops.map((shop) => (
                <div
                  key={shop.id}
                  onClick={() => handleShopClick(shop)}
                  onMouseEnter={() => setHoveredShop(shop.id)}
                  onMouseLeave={() => setHoveredShop(null)}
                  className={`p-4 cursor-pointer transition-all flex gap-3 ${
                    selectedShop?.id === shop.id
                      ? "bg-purple-500/20 border-l-4 border-purple-400"
                      : hoveredShop === shop.id
                      ? "bg-white/5"
                      : "hover:bg-white/5"
                  }`}
                >
                  {shop.photo_url && (
                    <img
                      src={shop.photo_url}
                      alt={shop.name}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <h3 className="text-white font-semibold text-sm truncate">{shop.name}</h3>
                        {/* Show sparkle indicator for top-rated shops (12+ total rating) */}
                        {shop.avg_happiness && shop.avg_rizz && shop.avg_experience && 
                         (shop.avg_happiness + shop.avg_rizz + shop.avg_experience) >= 12 && (
                          <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-purple-400 text-xs font-medium bg-purple-400/10 px-2 py-1 rounded-full flex-shrink-0 ml-2">
                        {shop.distance.toFixed(1)} km
                      </span>
                    </div>
                    <p className="text-white/60 text-xs mb-2 line-clamp-2">{shop.address}</p>
                    {(shop.avg_happiness || shop.avg_rizz || shop.avg_experience) && (
                      <div className="mt-2 flex gap-3 text-xs">
                        {shop.avg_happiness && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-pink-400" />
                            <span className="text-white/50">Happy</span>
                            <span className="text-white/70 font-semibold">{shop.avg_happiness.toFixed(1)}</span>
                          </div>
                        )}
                        {shop.avg_rizz && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-cyan-400" />
                            <span className="text-white/50">Rizz</span>
                            <span className="text-white/70 font-semibold">{shop.avg_rizz.toFixed(1)}</span>
                          </div>
                        )}
                        {shop.avg_experience && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-purple-400" />
                            <span className="text-white/50">Exp</span>
                            <span className="text-white/70 font-semibold">{shop.avg_experience.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {shop.review_count !== undefined && shop.review_count > 0 && (
                      <p className="text-white/40 text-[10px] mt-1">
                        {shop.review_count} {shop.review_count === 1 ? 'review' : 'reviews'}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Map */}
      <div className="flex-1 relative">
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <Map
              defaultCenter={location ? { lat: location.latitude, lng: location.longitude } : DEFAULT_CENTER}
              defaultZoom={DEFAULT_ZOOM}
              mapId="pizza-map"
              gestureHandling="greedy"
              disableDefaultUI={false}
              style={{ width: "100%", height: "100%" }}
              onLoad={(map) => { mapRef.current = map; }}
            >
              {/* Current location marker */}
              {location && (
                <AdvancedMarker
                  position={{ lat: location.latitude, lng: location.longitude }}
                >
                  <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                </AdvancedMarker>
              )}

              {/* Pizza shop markers */}
              {shops.map((shop) => (
                <Marker
                  key={shop.id}
                  position={{ lat: shop.lat, lng: shop.lng }}
                  onClick={() => setSelectedShop(shop)}
                />
              ))}

              {/* Info window for selected shop */}
              {selectedShop && (
                <InfoWindow
                  position={{ lat: selectedShop.lat, lng: selectedShop.lng }}
                  onCloseClick={() => setSelectedShop(null)}
                  pixelOffset={[0, -40]}
                >
                  <div className="p-2">
                    <h3 className="font-semibold text-sm mb-1">{selectedShop.name}</h3>
                    <p className="text-xs text-gray-600 mb-1">{selectedShop.address}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-xs text-purple-600 font-medium">
                        {selectedShop.distance.toFixed(1)} km away
                      </p>
                      {selectedShop.review_count !== undefined && selectedShop.review_count > 0 && (
                        <p className="text-xs text-gray-500">
                          • {selectedShop.review_count} {selectedShop.review_count === 1 ? 'review' : 'reviews'}
                        </p>
                      )}
                    </div>
                    {(selectedShop.avg_happiness || selectedShop.avg_rizz || selectedShop.avg_experience) && (
                      <div className="space-y-1 border-t border-gray-200 pt-2">
                        {selectedShop.avg_happiness && (
                          <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-gray-500 w-16">Happiness</span>
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(n => (
                                <Star 
                                  key={n} 
                                  className={`w-3 h-3 ${n <= Math.round(selectedShop.avg_happiness!) ? 'text-pink-500 fill-pink-500' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            <span className="text-gray-700 font-semibold ml-1">{selectedShop.avg_happiness.toFixed(1)}</span>
                          </div>
                        )}
                        {selectedShop.avg_rizz && (
                          <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-gray-500 w-16">Rizz</span>
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(n => (
                                <Star 
                                  key={n} 
                                  className={`w-3 h-3 ${n <= Math.round(selectedShop.avg_rizz!) ? 'text-cyan-500 fill-cyan-500' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            <span className="text-gray-700 font-semibold ml-1">{selectedShop.avg_rizz.toFixed(1)}</span>
                          </div>
                        )}
                        {selectedShop.avg_experience && (
                          <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-gray-500 w-16">Experience</span>
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(n => (
                                <Star 
                                  key={n} 
                                  className={`w-3 h-3 ${n <= Math.round(selectedShop.avg_experience!) ? 'text-purple-500 fill-purple-500' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            <span className="text-gray-700 font-semibold ml-1">{selectedShop.avg_experience.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>

          {/* Recenter button */}
          {location && (
            <button
              onClick={() => {
                if (mapRef.current) {
                  mapRef.current.panTo({ lat: location.latitude, lng: location.longitude });
                  mapRef.current.setZoom(DEFAULT_ZOOM);
                }
              }}
              className="absolute bottom-6 right-6 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all"
              title="Return to current location"
            >
              <Navigation className="w-5 h-5 text-purple-600" />
            </button>
          )}
        </div>
    </div>
  );
}

export default SearchPage;
