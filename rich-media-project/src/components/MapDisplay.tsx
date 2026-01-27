'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useMemo } from 'react';
import { POIEntry } from "@/app/types";
import { parseTime } from "@/app/utils";
import L from 'leaflet';

import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

export default function MapDisplay({ pois, onPoiClick }: { pois: POIEntry[], onPoiClick: (t: number) => void }) {
  const defaultCenter: [number, number] = [40.4406, -79.9959];

  const customIcon = useMemo(() => {
    const getSrc = (img: any) => (typeof img === 'string' ? img : img.src);
    return L.icon({ 
        iconRetinaUrl: getSrc(iconRetina), 
        iconUrl: getSrc(iconMarker), 
        shadowUrl: getSrc(iconShadow),
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
    });
  }, []);

  return (
    // Utilisation de Tailwind pour la taille et les bordures
    <div className="h-full w-full rounded-lg overflow-hidden border border-swedish-grey shadow-sm">
      <MapContainer center={defaultCenter} zoom={9} style={{ height: '100%', width: '100%' }}>
        <TileLayer 
            attribution='&copy; OpenStreetMap' 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        />
        {pois && pois.map((poi) => (
            <Marker key={poi.id} position={[poi.latitude, poi.longitude]} icon={customIcon}>
              <Popup>
                <strong className="text-swedish-blue text-base">{poi.title_fr}</strong>
                <p className="text-sm my-2 text-gray-700">{poi.description_fr}</p>
                <hr className="my-2 border-gray-200"/>
                
                <div className="max-h-[150px] overflow-y-auto">
                    {poi.timestamps && poi.timestamps.length > 0 ? (
                        <>
                            <small className="font-bold text-gray-500 uppercase text-xs">Scènes clés :</small>
                            {poi.timestamps.map((scene, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => onPoiClick(parseTime(scene.time))}
                                    className="block w-full text-left bg-gray-50 border border-gray-200 rounded p-2 mt-1 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                                >
                                    <span className="font-bold text-swedish-blue">▶ {scene.time}</span>
                                    <br/>
                                    <span className="text-xs text-gray-600 font-normal">
                                        {scene.scene_fr}
                                    </span>
                                </button>
                            ))}
                        </>
                    ) : (
                        <em className="text-xs text-gray-500 text-center block">Lieu général</em>
                    )}
                </div>
              </Popup>
            </Marker>
        ))}
      </MapContainer>
    </div>
  );
}