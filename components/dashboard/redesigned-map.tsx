"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Plus, Minus, Layers, Factory, MapPin, Wheat, ExternalLink } from "lucide-react";

export interface MapLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  count: number;
  tonnage: number;
  alamat?: string;
  ketua?: string;
  komoditasList?: string[];
}

const DEFAULT_LOCATIONS: MapLocation[] = [
  { id: "1", name: "Gapoktan Lampung Tengah", lat: -4.8655, lng: 105.2663, count: 4, tonnage: 2381.76, alamat: "Kec. Terbanggi Besar, Kab. Lampung Tengah", ketua: "H. Ahmad Siba", komoditasList: ["Gabah", "Jagung"] },
  { id: "2", name: "Gapoktan Tanggamus Mandiri", lat: -5.3900, lng: 104.6200, count: 3, tonnage: 1702.30, alamat: "Kec. Kota Agung, Kab. Tanggamus", ketua: "Bpk. Rahmad", komoditasList: ["Kakao", "Gabah"] },
  { id: "3", name: "Poktan Tulang Bawang Abadi", lat: -4.3822, lng: 105.3676, count: 5, tonnage: 1581.20, alamat: "Kec. Menggala, Kab. Tulang Bawang", ketua: "Bpk. Suparno", komoditasList: ["Gabah", "Singkong"] },
  { id: "4", name: "Gapoktan Lampung Utara Jaya", lat: -4.8258, lng: 104.8863, count: 3, tonnage: 1441.30, alamat: "Kec. Kotabumi, Kab. Lampung Utara", ketua: "H. Yulianto", komoditasList: ["Gabah"] },
  { id: "5", name: "Gapoktan Lampung Timur Sejahtera", lat: -5.1136, lng: 105.6778, count: 6, tonnage: 938.80, alamat: "Kec. Sukadana, Kab. Lampung Timur", ketua: "Bpk. Hendra", komoditasList: ["Gabah", "Jagung"] },
  { id: "6", name: "Poktan Mesuji Makmur", lat: -3.9850, lng: 105.4200, count: 2, tonnage: 450.20, alamat: "Kec. Simpang Pematang, Kab. Mesuji", ketua: "Bpk. Santoso", komoditasList: ["Singkong"] },
  { id: "7", name: "Gapoktan Way Kanan", lat: -4.5120, lng: 104.5240, count: 4, tonnage: 380.60, alamat: "Kec. Blambangan Umpu, Kab. Way Kanan", ketua: "Bpk. Ridwan", komoditasList: ["Gabah"] },
  { id: "8", name: "Gapoktan Lampung Barat", lat: -5.1480, lng: 104.1950, count: 2, tonnage: 220.40, alamat: "Kec. Liwa, Kab. Lampung Barat", ketua: "Bpk. Bambang", komoditasList: ["Kakao"] },
];

const createDryerIcon = (count: number, tonnage: number) => {
  let bgColor = "#ef4444"; // < 200 Ton (red)
  if (tonnage > 1000) bgColor = "#10b981"; // > 1000 Ton (green)
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

interface RedesignedMapProps {
  markers?: MapLocation[];
}

export function RedesignedMap({ markers }: RedesignedMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayMarkers = markers && markers.length > 0 ? markers : DEFAULT_LOCATIONS;

  if (!mounted) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm h-[536px] flex items-center justify-center text-slate-400">
        Memuat Peta Dryer GIS...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-3 w-full h-[536px]">
      {/* Header Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Factory className="h-4.5 w-4.5 text-blue-600" />
          <h3 className="text-xs font-black uppercase text-slate-800 tracking-tight">
            PETA SEBARAN UNIT DRYER (GIS)
          </h3>
        </div>
        <span className="text-[10px] font-bold text-slate-500 bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full border border-blue-100">
          {displayMarkers.length} Lokasi Dryer
        </span>
      </div>

      {/* Map Container */}
      <div className="relative flex-1 w-full rounded-xl overflow-hidden border border-slate-200 min-h-[460px]">
        {/* Custom Controls - Zoom */}
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
              <span className="h-2.5 w-2.5 rounded-full bg-[#10b981] shrink-0" />
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
              <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444] shrink-0" />
              <span>&lt; 200 Ton</span>
            </div>
          </div>
        </div>

        {/* Leaflet Map */}
        <MapContainer
          center={[-4.85, 105.2]}
          zoom={8}
          zoomControl={false}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {displayMarkers.map((loc) => (
            <Marker
              key={loc.id}
              position={[loc.lat, loc.lng]}
              icon={createDryerIcon(loc.count, loc.tonnage)}
            >
              {/* Detailed Rich Popup Card on Click */}
              <Popup className="custom-leaflet-popup min-w-[240px]">
                <div className="p-2 space-y-2 text-slate-800 font-sans">
                  <div className="border-b border-slate-100 pb-1.5">
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-wider block">
                      DETAIL UNIT DRYER GAPOKTAN
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 leading-snug">
                      {loc.name}
                    </h4>
                    {loc.alamat && (
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>{loc.alamat}</span>
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-1">
                    <div className="bg-blue-50 p-1.5 rounded-lg border border-blue-100">
                      <span className="text-[9px] font-medium text-blue-600 block">Unit Dryer</span>
                      <span className="font-extrabold text-blue-700 flex items-center gap-1">
                        <Factory className="h-3 w-3" />
                        {loc.count} Unit
                      </span>
                    </div>
                    <div className="bg-emerald-50 p-1.5 rounded-lg border border-emerald-100">
                      <span className="text-[9px] font-medium text-emerald-600 block">Total Produksi</span>
                      <span className="font-extrabold text-emerald-700">
                        {loc.tonnage.toString().replace('.', ',')} Ton
                      </span>
                    </div>
                  </div>

                  {loc.ketua && (
                    <div className="text-[11px] text-slate-600">
                      Ketua: <span className="font-semibold">{loc.ketua}</span>
                    </div>
                  )}

                  {loc.komoditasList && loc.komoditasList.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap pt-0.5">
                      {loc.komoditasList.map((k) => (
                        <span key={k} className="text-[9px] font-extrabold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Wheat className="h-2.5 w-2.5" />
                          {k}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100">
                    <a
                      href={`/dashboard/gapoktan/${loc.id}`}
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
    </div>
  );
}
