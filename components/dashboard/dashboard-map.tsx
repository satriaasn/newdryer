"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
  komoditas?: string;
}

interface DashboardMapProps {
  markers: MapMarker[];
  onMarkerClick: (id: string) => void;
  selectedMarkerId?: string | null;
  theme?: string;
}

const customIcon = typeof window !== "undefined"
  ? L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    })
  : undefined;

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
        // Fly/pan to selected marker's coordinates
        map.flyTo([selectedMarker.latitude, selectedMarker.longitude], 13, {
          animate: true,
          duration: 1.5,
        });

        // Open marker popup after map finishes animating or with a slight delay
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
    <MapContainer
      center={[-3.3971, 115.2668]}
      zoom={5}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%", zIndex: 10 }}
    >
      <TileLayer
        attribution="&copy; OSM"
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
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
          icon={customIcon}
          eventHandlers={{ click: () => onMarkerClick(m.id) }}
        >
          <Popup className="custom-popup">
            <div className="p-1 min-w-[160px]">
              <h3 className="font-bold text-[#0F172A] text-sm leading-tight">{m.name}</h3>
              <p className="text-[10px] text-slate-500 mt-1 italic leading-tight">{m.address}</p>
              {m.komoditas && (
                <div className="mt-2 pt-1 border-t border-slate-100">
                  <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Komoditas:</span>
                  <p className="text-[10px] font-medium text-[#0F172A] leading-tight">{m.komoditas}</p>
                </div>
              )}
              <div className="mt-3 pt-2 border-t border-slate-100">
                <a
                  href={`/gapoktan/${m.id}`}
                  className="inline-flex items-center justify-center w-full px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider hover:text-white transition-all shadow-sm hover:scale-[1.02] active:scale-95 duration-200 text-center no-underline"
                >
                  Lihat Detail →
                </a>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
