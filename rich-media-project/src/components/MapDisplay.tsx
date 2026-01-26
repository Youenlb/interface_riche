'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { POIEntry } from "@/app/types";
import { parseTime } from "@/app/utils";
import L from 'leaflet';

import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const icon = L.icon({ 
    iconRetinaUrl: iconRetina.src, 
    iconUrl: iconMarker.src, 
    shadowUrl: iconShadow.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

export default function MapDisplay({ pois, onPoiClick }: { pois: POIEntry[], onPoiClick: (t: number) => void }) {
  // Centre par défaut sur Pittsburgh (vu tes datas)
  const defaultCenter: [number, number] = [40.4406, -79.9959];

  return (
    <div style={{ height: '400px', width: '100%', marginTop: '20px', borderRadius:8, overflow:'hidden', border: '1px solid #ccc' }}>
      <MapContainer center={defaultCenter} zoom={9} style={{ height: '100%', width: '100%' }}>
        <TileLayer 
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        />
        
        {pois.map((poi) => (
            <Marker key={poi.id} position={[poi.latitude, poi.longitude]} icon={icon}>
              <Popup>
                <strong>{poi.title_fr}</strong>
                <p style={{fontSize: '0.9em', margin: '5px 0'}}>{poi.description_fr}</p>
                <hr style={{margin: '5px 0'}}/>
                <div style={{maxHeight: '100px', overflowY: 'auto'}}>
                    {poi.timestamps.map((scene, idx) => (
                        <button 
                            key={idx}
                            onClick={() => onPoiClick(parseTime(scene.time))}
                            style={{
                                display: 'block',
                                width: '100%',
                                textAlign: 'left',
                                background: '#f0f0f0',
                                border: 'none',
                                padding: '4px',
                                marginBottom: '2px',
                                cursor: 'pointer',
                                fontSize: '0.85em'
                            }}
                        >
                            ▶ {scene.time} - {scene.scene_fr}
                        </button>
                    ))}
                </div>
              </Popup>
            </Marker>
        ))}
      </MapContainer>
    </div>
  );
}