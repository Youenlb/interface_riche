'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { POI } from "@/app/types";
import L from 'leaflet';

// Correction d'icônes Leaflet pour Next.js
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const icon = L.icon({ 
    iconRetinaUrl: iconRetina.src, 
    iconUrl: iconMarker.src, 
    shadowUrl: iconShadow.src 
});

export default function MapDisplay({ url, onPoiClick }: { url: string, onPoiClick: (t: number) => void }) {
  const [pois, setPois] = useState<POI[]>([]);

  useEffect(() => {
    fetch(url).then(r => r.json()).then(setPois);
  }, [url]);

  return (
    <div style={{ height: '300px', marginTop: '20px' }}>
      <MapContainer center={[40.7, -80.0]} zoom={6} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {pois.map((poi, i) => {
          const [lat, lng] = poi.pos.split(',').map(Number);
          return (
            <Marker key={i} position={[lat, lng]} icon={icon}>
              <Popup>
                <strong>{poi.label}</strong><br/>
                <button onClick={() => onPoiClick(poi.time)}>Voir dans le film</button>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}