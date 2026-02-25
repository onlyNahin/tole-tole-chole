
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PROFILES } from '../constants';
import { UserProfile } from '../types';
import { useSiteConfig } from '../SiteConfigContext';

// Access the global L variable from Leaflet script in index.html
declare const L: any;

const LocationView: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useSiteConfig();
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerRef = useRef<any>(null);

  // Rajshahi Center Coordinates
  const RAJSHAHI_CENTER = [24.3745, 88.6042];

  useEffect(() => {
    // Check if Leaflet is loaded
    if (typeof L === 'undefined' || !mapContainerRef.current) return;

    // Initialize Map
    if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
            center: RAJSHAHI_CENTER,
            zoom: 13,
            zoomControl: false, // We'll add custom controls if needed or rely on touch
            attributionControl: false
        });

        // Add attribution manually in a cleaner way if desired, or let Leaflet handle it via tile options
        L.control.attribution({ prefix: false }).addAttribution('&copy; OpenStreetMap').addTo(map);

        mapInstanceRef.current = map;
    }

    // Initialize Markers
    PROFILES.forEach(profile => {
        if (profile.coordinates) {
            const { lat, lng } = profile.coordinates;
            
            // Custom HTML Icon for Profile Pic
            const iconHtml = `
                <div class="relative group cursor-pointer transition-transform hover:scale-110" style="width: 48px; height: 48px;">
                    <div class="w-full h-full rounded-full p-0.5 bg-white dark:bg-gray-800 shadow-md border-2 border-primary overflow-hidden">
                        <img src="${profile.image}" class="w-full h-full object-cover rounded-full" />
                    </div>
                    ${profile.isOnline ? '<div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>' : ''}
                </div>
            `;

            const icon = L.divIcon({
                className: 'custom-map-marker',
                html: iconHtml,
                iconSize: [48, 48],
                iconAnchor: [24, 24]
            });

            const marker = L.marker([lat, lng], { icon: icon }).addTo(mapInstanceRef.current);
            
            marker.on('click', () => {
                setSelectedUser(profile);
                mapInstanceRef.current.setView([lat, lng], 15, { animate: true });
            });
        }
    });

    // Add "Me" Marker (Simulated Geolocation)
    const meIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
            <div class="flex flex-col items-center justify-center">
                <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                <div class="w-16 h-16 bg-blue-500/10 rounded-full absolute animate-ping"></div>
            </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
    L.marker([24.3700, 88.6000], { icon: meIcon }).addTo(mapInstanceRef.current); // Slightly offset from center

    return () => {
        // Cleanup logic if component unmounts - usually redundant for a persistent tab but good practice
        // mapInstanceRef.current.remove(); // Careful with React StrictMode double mount
    };
  }, []); // Run once on mount

  // Handle Theme Changes for Tiles
  useEffect(() => {
     if (!mapInstanceRef.current) return;

     if (layerRef.current) {
         mapInstanceRef.current.removeLayer(layerRef.current);
     }

     const tileUrl = isDark 
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' // Dark Matter
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'; // Voyager (cleaner than OSM default)

     layerRef.current = L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: 'abcd',
     }).addTo(mapInstanceRef.current);

  }, [isDark]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleRecenter = () => {
      mapInstanceRef.current?.setView(RAJSHAHI_CENTER, 13, { animate: true });
      setSelectedUser(null);
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden md:rounded-3xl bg-gray-100 dark:bg-gray-900">
      
      {/* Map Header Overlay */}
      <div className="absolute top-0 left-0 w-full z-[400] p-4 bg-gradient-to-b from-white/90 to-transparent dark:from-surface-dark/90 pointer-events-none">
         <div className="flex justify-between items-start pointer-events-auto">
             <div>
                <h1 className="text-2xl font-display font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <span className="material-icons-round text-primary">location_on</span>
                    কাছাকাছি মানুষজন
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">রাজশাহীর আশেপাশে আপনার ম্যাচ খুঁজুন</p>
             </div>
             
             {/* Map Controls */}
             <div className="flex flex-col gap-2 bg-white dark:bg-surface-dark rounded-xl shadow-lg p-1 border border-gray-100 dark:border-gray-700">
                <button onClick={handleZoomIn} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors">
                    <span className="material-icons-round">add</span>
                </button>
                <button onClick={handleZoomOut} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors">
                    <span className="material-icons-round">remove</span>
                </button>
                <div className="h-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
                <button onClick={handleRecenter} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-primary transition-colors" title="Reset View">
                    <span className="material-icons-round">my_location</span>
                </button>
             </div>
         </div>
      </div>

      {/* Leaflet Map Container */}
      <div id="map" ref={mapContainerRef} className="flex-1 w-full h-full z-0"></div>

      {/* User Preview Card Overlay */}
      {selectedUser && (
        <div className="absolute bottom-4 left-4 right-4 z-[500] animate-float-up">
           <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-4 relative max-w-md mx-auto">
              <button 
                onClick={() => setSelectedUser(null)} 
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1"
              >
                  <span className="material-icons-round text-lg">close</span>
              </button>
              
              <div onClick={() => navigate(`/app/profile`)} className="cursor-pointer">
                  <img src={selectedUser.image} className="w-16 h-16 rounded-full object-cover border-2 border-primary shadow-sm" alt={selectedUser.name} />
              </div>
              
              <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-lg text-gray-800 dark:text-white truncate flex items-center gap-1">
                      {selectedUser.name}, {selectedUser.age}
                      {selectedUser.isVerified && <span className="material-icons-round text-blue-500 text-sm">verified</span>}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate flex items-center gap-1">
                      <span className="material-icons-round text-[10px]">place</span>
                      {selectedUser.location}
                  </p>
                  <div className="flex gap-2">
                      <button 
                        onClick={() => navigate(`/app/chat/${selectedUser.id}`)}
                        className="flex-1 bg-primary text-white text-xs font-bold py-2 rounded-lg shadow hover:bg-primary-dark transition-colors flex items-center justify-center gap-1"
                      >
                         <span className="material-icons-round text-sm">chat</span> মেসেজ
                      </button>
                      <button className="p-2 bg-pink-50 dark:bg-pink-900/20 text-pink-500 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors">
                          <span className="material-icons-round text-lg">favorite</span>
                      </button>
                  </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default LocationView;
