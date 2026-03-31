"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { useEffect, useState, useMemo } from "react";
import type { Gapoktan } from "@/lib/types";
import dynamic from "next/dynamic";
import { MapPin, Wheat, Factory } from "lucide-react";

// Dynamically import map to avoid SSR issues with Leaflet
const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false });

export default function MapsPage() {
  const [gapoktan, setGapoktan] = useState<Gapoktan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Gapoktan | null>(null);
  const [leafletReady, setLeafletReady] = useState(false);
  const [customIcon, setCustomIcon] = useState<any>(null);

  useEffect(() => {
    fetch('/api/gapoktan').then(r => r.json()).then(data => {
      setGapoktan(Array.isArray(data) ? data.filter(g => g.latitude && g.longitude) : []);
    }).finally(() => setLoading(false));

    // Load Leaflet CSS and icon on client side
    if (typeof window !== 'undefined') {
      import('leaflet').then(L => {
        // Fix default marker icon
        const icon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });
        setCustomIcon(icon);
        setLeafletReady(true);
      });

      // Inject Leaflet CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
    }
  }, []);

  // Center of West Java
  const center: [number, number] = [-7.0, 107.4];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-muted/20">
        <div className="p-8 space-y-6">
          <header>
            <h1 className="text-3xl font-bold tracking-tight">Peta GIS Gapoktan</h1>
            <p className="text-muted-foreground">Lokasi seluruh gapoktan dan unit dryer pada peta</p>
          </header>

          <div className="grid gap-6 lg:grid-cols-4">
            {/* Map */}
            <div className="lg:col-span-3 rounded-2xl border bg-card/60 overflow-hidden" style={{ height: '600px' }}>
              {loading || !leafletReady ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center space-y-2">
                    <MapPin className="h-8 w-8 mx-auto animate-pulse" />
                    <p>Memuat peta...</p>
                  </div>
                </div>
              ) : (
                <MapContainer
                  center={center}
                  zoom={9}
                  style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {gapoktan.map(g => (
                    <Marker
                      key={g.id}
                      position={[g.latitude!, g.longitude!]}
                      icon={customIcon}
                      eventHandlers={{ click: () => setSelected(g) }}
                    >
                      <Popup>
                        <div className="min-w-[200px]">
                          <h3 className="font-bold text-sm">{g.name}</h3>
                          <p className="text-xs text-gray-500">
                            {g.desa?.name}, {g.desa?.kecamatan?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {g.desa?.kecamatan?.kabupaten?.name}
                          </p>
                          {g.ketua && <p className="text-xs mt-1">Ketua: {g.ketua}</p>}
                          {g.dryer_units && <p className="text-xs">Dryer: {g.dryer_units.length} unit</p>}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}
            </div>

            {/* Sidebar list */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              <p className="text-sm font-medium text-muted-foreground">{gapoktan.length} Lokasi Gapoktan</p>
              {gapoktan.map(g => (
                <div
                  key={g.id}
                  onClick={() => setSelected(g)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                    selected?.id === g.id ? 'border-primary bg-primary/5' : 'bg-card/60 hover:border-primary/30'
                  }`}
                >
                  <h4 className="font-semibold text-sm">{g.name}</h4>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    {g.desa?.name}
                  </div>
                  {g.ketua && (
                    <p className="text-xs text-muted-foreground mt-1">Ketua: {g.ketua}</p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {g.komoditas?.map(k => (
                      <span key={k.id} className="flex items-center gap-0.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                        <Wheat className="h-2.5 w-2.5" />
                        {k.name}
                      </span>
                    ))}
                  </div>
                  {g.dryer_units && g.dryer_units.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                      <Factory className="h-3 w-3" />
                      {g.dryer_units.length} unit dryer
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {g.latitude?.toFixed(4)}, {g.longitude?.toFixed(4)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
