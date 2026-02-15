'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Professional Custom Icon (SVG)
const customIcon = L.divIcon({
    className: 'custom-icon',
    html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2F5C3B" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 drop-shadow-md">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3" fill="#F4C430" stroke="none"></circle>
    </svg>
  `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
});

// Custom Search Component inside Map
function SearchControl({ onSelect }: { onSelect: (pos: { lat: number, lng: number }) => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const map = useMapEvents({});
    const ignoreNextSearch = useRef(false);

    // Debounce search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (ignoreNextSearch.current) {
                ignoreNextSearch.current = false;
                return;
            }

            if (query.length > 2) {
                setSearching(true);
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ar&addressdetails=1&limit=5`);
                    const data = await response.json();
                    setResults(data);
                    setShowResults(true);
                } catch (error) {
                    console.error(error);
                } finally {
                    setSearching(false);
                }
            } else {
                setResults([]);
                setShowResults(false);
            }
        }, 500); // 500ms delay

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSelect = (result: any) => {
        ignoreNextSearch.current = true; // Skip next search effect
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        const pos = { lat, lng };
        onSelect(pos);
        map.flyTo(pos, 15);
        setResults([]);
        setShowResults(false);
        setQuery(result.display_name.split(',')[0]); // Keep short name
    };

    return (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[90%] sm:w-[400px] z-[1000]">
            <div className="relative shadow-lg rounded-full bg-white transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center px-4 py-3">
                    <span className="text-gray-400 mr-3">
                        {searching ? (
                            <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-[--primary] rounded-full"></div>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        )}
                    </span>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar dirección, ciudad o campo..."
                        className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 text-sm sm:text-base h-full"
                        onFocus={() => setShowResults(true)}
                    />
                    {query && (
                        <button
                            onClick={() => { setQuery(''); setResults([]); }}
                            className="text-gray-400 hover:text-gray-600 p-1"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    )}
                </div>
            </div>

            {showResults && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 border border-gray-100">
                    <ul className="divide-y divide-gray-50 max-h-60 overflow-y-auto">
                        {results.map((r, i) => (
                            <li
                                key={i}
                                onClick={() => handleSelect(r)}
                                className="p-3 hover:bg-green-50/50 cursor-pointer flex items-start gap-3 transition-colors text-left group"
                            >
                                <span className="mt-1 text-gray-400 group-hover:text-[--primary] transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                </span>
                                <div>
                                    <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 line-clamp-1">{r.address?.road || r.name || r.display_name.split(',')[0]}</p>
                                    <p className="text-xs text-gray-500 line-clamp-1">{r.address?.city || r.address?.town || r.address?.village || r.address?.state || r.display_name}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

// Component to handle clicks
function LocationMarker({ position, setPosition }: { position: { lat: number, lng: number } | null, setPosition: (pos: { lat: number, lng: number }) => void }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position} icon={customIcon}></Marker>
    );
}

interface MapPickerProps {
    onLocationSelect: (location: { lat: number, lng: number }) => void;
    initialLocation?: { lat: number, lng: number };
}

// Component to handle map interactions based on active state
function MapInteractionHandler({ active }: { active: boolean }) {
    const map = useMapEvents({});

    useEffect(() => {
        if (active) {
            map.dragging.enable();
            map.touchZoom.enable();
            map.doubleClickZoom.enable();
            map.scrollWheelZoom.enable();
            map.boxZoom.enable();
            map.keyboard.enable();
        } else {
            map.dragging.disable();
            map.touchZoom.disable();
            map.doubleClickZoom.disable();
            map.scrollWheelZoom.disable();
            map.boxZoom.disable();
            map.keyboard.disable();
        }
    }, [active, map]);

    return null;
}

export default function MapPicker({ onLocationSelect, initialLocation }: MapPickerProps) {
    // Default center (Cordoba/Argentina center)
    const defaultCenter = { lat: -33.123, lng: -64.348 };
    const [position, setPosition] = useState<{ lat: number, lng: number } | null>(initialLocation || null);
    const [isActive, setIsActive] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleSetPosition = (pos: { lat: number, lng: number }) => {
        setPosition(pos);
        onLocationSelect(pos);
    };

    // Handle click outside to deactivate
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsActive(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={`h-full w-full bg-gray-50 relative transition-all duration-500 ease-in-out group ${!isActive ? 'grayscale hover:grayscale-0' : ''}`}
            onClick={() => setIsActive(true)}
            onTouchStart={() => setIsActive(true)}
        >
            <MapContainer
                key={initialLocation ? `${initialLocation.lat}-${initialLocation.lng}` : 'map'}
                center={initialLocation || defaultCenter}
                zoom={6}
                scrollWheelZoom={false} // Managed by handler
                dragging={false} // Managed by handler
                touchZoom={false} // Managed by handler
                doubleClickZoom={false} // Managed by handler
                zoomControl={false} // We can add custom zoom control if needed, or leave default
                style={{ height: '100%', width: '100%' }}
            >
                {/* CartoDB Voyager: Clean, modern, professional map style */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                <MapInteractionHandler active={isActive} />
                <SearchControl onSelect={handleSetPosition} />
                <LocationMarker position={position} setPosition={handleSetPosition} />
            </MapContainer>

            {/* Overlay Hint */}
            {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1000] bg-white/10 group-hover:bg-transparent transition-colors">
                    <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Tocá para interactuar
                    </div>
                </div>
            )}
        </div>
    );
}
