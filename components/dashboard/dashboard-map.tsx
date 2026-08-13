"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Plus, Minus, Layers, Factory, MapPin, Wheat, ExternalLink } from "lucide-react";

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
  komoditas?: string;
  komoditasList?: string[];
  count?: number;
  tonnage?: number;
  ketua?: string;
}

interface DashboardMapProps {
  markers: MapMarker[];
  onMarkerClick?: (id: string) => void;
  selectedMarkerId?: string | null;
  theme?: string;
}

const createDryerIcon = (count: number = 1, tonnage: number = 0) => {
  let bgColor = "#10b981"; // < 200 Ton (green)
  if (tonnage > 1000) bgColor = "#ef4444"; // > 1000 Ton (red)
  else if (tonnage >= 500) bgColor = "#f97316"; // 500-1000 Ton (orange)
  else if (tonnage >= 200) bgColor = "#eab308"; // 200-500 Ton (yellow)

  const factorySvg = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4H2v16z"/></svg>`;

  return L.divIcon({
    html: `<div style="
      background-color: ${bgColor}; 
      padding: 4px 9px;
      border-radius: 20px; 
      display: inline-flex; 
      align-items: center; 
      gap: 5px;
      color: white; 
      font-weight: 800; 
      font-size: 11px; 
      border: 2px solid white; 
      box-shadow: 0 3px 10px rgba(0,0,0,0.3);
      font-family: system-ui, sans-serif;
      white-space: nowrap;
    ">
      ${factorySvg}
      <span>${count} Dryer</span>
    </div>`,
    className: "custom-dryer-badge-icon",
    iconSize: [84, 28],
    iconAnchor: [42, 14],
  });
};

interface MapControllerProps {
  selectedMarkerId?: string | null;
  markers: MapMarker[];
  markerRefs: React.MutableRefObject<Record<string, L.Marker | null>>;
}

function MapController({ selectedMarkerId, markers, markerRefs }: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (selectedMarkerId) {
      const selectedMarker = markers.find((m) => m.id === selectedMarkerId);
      if (selectedMarker) {
        map.flyTo([selectedMarker.latitude, selectedMarker.longitude], 12, {
          animate: true,
          duration: 1.5,
        });

        const timer = setTimeout(() => {
          const markerInstance = markerRefs.current[selectedMarkerId];
          if (markerInstance) {
            markerInstance.openPopup();
          }
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [selectedMarkerId, markers, map, markerRefs]);

  return null;
}

export default function DashboardMap({ markers, onMarkerClick, selectedMarkerId, theme }: DashboardMapProps) {
  const [ready, setReady] = useState(false);
  const markerRefs = useRef<Record<string, L.Marker | null>>({});

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <div className="relative h-full w-full rounded-2xl overflow-hidden border border-slate-200">
      {/* Custom Map Controls on Left */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-1.5">
        <div className="bg-white rounded-lg border border-slate-200 shadow-md flex flex-col overflow-hidden">
          <button 
            onClick={() => {
              const mapEl = document.querySelector(".leaflet-container") as any;
              if (mapEl?._leaflet_map) mapEl._leaflet_map.zoomIn();
            }}
            className="p-2 hover:bg-slate-100 text-slate-700 transition-all border-b border-slate-100"
            title="Zoom In"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button 
            onClick={() => {
              const mapEl = document.querySelector(".leaflet-container") as any;
              if (mapEl?._leaflet_map) mapEl._leaflet_map.zoomOut();
            }}
            className="p-2 hover:bg-slate-100 text-slate-700 transition-all"
            title="Zoom Out"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>

        <button 
          className="p-2 bg-white rounded-lg border border-slate-200 shadow-md hover:bg-slate-100 text-slate-700 transition-all"
          title="Layer Settings"
        >
          <Layers className="h-4 w-4" />
        </button>
      </div>

      {/* Legend Box Overlay - Top Right */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-slate-200 shadow-md text-xs space-y-1.5 min-w-[135px]">
        <p className="text-[9px] font-extrabold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1">
          LEGENDA PRODUKSI (TON)
        </p>
        <div className="space-y-1 text-[10px] font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444] shrink-0" />
            <span>&gt; 1.000 Ton</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#f97316] shrink-0" />
            <span>500 - 1.000 Ton</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#eab308] shrink-0" />
            <span>200 - 500 Ton</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#10b981] shrink-0" />
            <span>&lt; 200 Ton</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <MapContainer
        center={[-4.85, 105.2]}
        zoom={8}
        zoomControl={false}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", zIndex: 10 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController
          selectedMarkerId={selectedMarkerId}
          markers={markers}
          markerRefs={markerRefs}
        />
        {markers.map((m) => (
          <Marker
            key={m.id}
            ref={(ref) => {
              if (ref) {
                markerRefs.current[m.id] = ref;
              } else {
                delete markerRefs.current[m.id];
              }
            }}
            position={[m.latitude, m.longitude]}
            icon={createDryerIcon(m.count || 1, m.tonnage || 0)}
            eventHandlers={{ 
              click: () => {
                if (onMarkerClick) onMarkerClick(m.id);
              } 
            }}
          >
            {/* Rich Card Detail Popup */}
            <Popup className="custom-leaflet-popup min-w-[240px]">
              <div className="p-2 space-y-2 text-slate-800 font-sans">
                <div className="border-b border-slate-100 pb-1.5">
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-wider block">
                    DETAIL UNIT DRYER GAPOKTAN
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">
                    {m.name || "Gapoktan"}
                  </h4>
                  {m.address && (
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{m.address}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-1">
                  <div className="bg-blue-50 p-1.5 rounded-lg border border-blue-100">
                    <span className="text-[9px] font-medium text-blue-600 block">Unit Dryer</span>
                    <span className="font-extrabold text-blue-700 flex items-center gap-1">
                      <Factory className="h-3 w-3" />
                      {m.count || 1} Unit
                    </span>
                  </div>
                  <div className="bg-emerald-50 p-1.5 rounded-lg border border-emerald-100">
                    <span className="text-[9px] font-medium text-emerald-600 block">Total Produksi</span>
                    <span className="font-extrabold text-emerald-700">
                      {(m.tonnage || 0).toString().replace('.', ',')} Ton
                    </span>
                  </div>
                </div>

                {m.ketua && (
                  <div className="text-[11px] text-slate-600">
                    Ketua: <span className="font-semibold">{m.ketua}</span>
                  </div>
                )}

                {((m.komoditasList && m.komoditasList.length > 0) || m.komoditas) && (
                  <div className="flex items-center gap-1 flex-wrap pt-0.5">
                    {(m.komoditasList || m.komoditas?.split(',') || []).map((k) => (
                      <span key={k.trim()} className="text-[9px] font-extrabold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Wheat className="h-2.5 w-2.5" />
                        {k.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100">
                  <a
                    href={`/gapoktan/${m.id}`}
                    className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-all no-underline shadow-sm"
                  >
                    <span>Lihat Detail & Riwayat</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
