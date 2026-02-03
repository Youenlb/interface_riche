'use client'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useMemo, useState, useCallback } from 'react';
import { POIEntry } from "@/app/types";
import { parseTime } from "@/app/utils";
import L from 'leaflet';

import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

interface MapDisplayProps {
  readonly pois: POIEntry[];
  readonly onPoiClick: (t: number) => void;
}

// Composant pour gérer le centrage de la carte
function MapController({ center, zoom }: { center: [number, number] | null; zoom: number }) {
  const map = useMap();
  
  useMemo(() => {
    if (center) {
      map.flyTo(center, zoom, {
        duration: 0.8,
        easeLinearity: 0.25
      });
    }
  }, [center, zoom, map]);
  
  return null;
}

export default function MapDisplay({ pois, onPoiClick }: MapDisplayProps) {
  const defaultCenter: [number, number] = [40.4406, -79.9959];
  const [focusedPosition, setFocusedPosition] = useState<[number, number] | null>(null);

  const handlePoiFocus = useCallback((lat: number, lng: number) => {
    setFocusedPosition([lat, lng]);
  }, []);

  const customIcon = useMemo(() => {
    const getSrc = (img: string | { src: string }) => (typeof img === 'string' ? img : img.src);
    
    return L.icon({ 
        iconRetinaUrl: getSrc(iconRetina), 
        iconUrl: getSrc(iconMarker), 
        shadowUrl: getSrc(iconShadow),
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
    });
  }, []);

  // Liste des POIs pour accessibilité (lecteurs d'écran)
  const poiListForScreenReaders = pois?.map(poi => poi.title_fr).join(', ');

  return (
    <div 
      className="h-full w-full rounded-2xl overflow-hidden border border-swedish-grey shadow-sm relative"
      role="application"
      aria-label="Carte interactive des lieux du film"
      aria-describedby="map-description"
    >
      {/* Description pour lecteurs d'écran */}
      <div id="map-description" className="sr-only">
        Carte affichant {pois?.length || 0} lieux de tournage: {poiListForScreenReaders}. 
        Utilisez les marqueurs pour découvrir les scènes associées à chaque lieu.
      </div>
      
      {/* Liste accessible des POIs (alternative à la carte) */}
      <details className="absolute top-2 right-2 z-[1000] bg-white rounded-lg shadow-lg max-w-[250px]">
        <summary className="px-3 py-2 cursor-pointer text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
          📍 Liste des lieux ({pois?.length || 0})
        </summary>
        <ul className="p-2 max-h-[200px] overflow-y-auto list-none m-0" role="list">
          {pois?.map((poi) => (
            <li key={`list-${poi.id}`} className="py-1">
              <button
                onClick={() => handlePoiFocus(poi.latitude, poi.longitude)}
                className="text-sm font-medium text-gray-800 hover:text-indigo-600 cursor-pointer bg-transparent border-none p-0 text-left focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded"
                aria-label={`Centrer la carte sur ${poi.title_fr}`}
              >
                {poi.title_fr}
              </button>
              {poi.timestamps && poi.timestamps.length > 0 && (
                <ul className="ml-3 list-none" role="list">
                  {poi.timestamps.map((scene) => (
                    <li key={`scene-${scene.time}`}>
                      <button
                        onClick={() => {
                          handlePoiFocus(poi.latitude, poi.longitude);
                          onPoiClick(parseTime(scene.time));
                        }}
                        className="text-xs text-indigo-600 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded px-1"
                        aria-label={`Aller à la scène ${scene.scene_fr} à ${scene.time}`}
                      >
                        ▶ {scene.time}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </details>

      <MapContainer center={defaultCenter} zoom={9} style={{ height: '100%', width: '100%' }}>
        <MapController center={focusedPosition} zoom={14} />
        <TileLayer 
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        />
        {pois?.map((poi) => (
            <Marker 
              key={poi.id} 
              position={[poi.latitude, poi.longitude]} 
              icon={customIcon}
              alt={poi.title_fr}
              title={poi.title_fr}
            >
              <Popup>
                <div role="dialog" aria-labelledby={`poi-title-${poi.id}`}>
                  <strong id={`poi-title-${poi.id}`} className="text-indigo-700 text-base">{poi.title_fr}</strong>
                  <p className="text-sm my-2 text-gray-700">{poi.description_fr}</p>
                  <hr className="my-2 border-gray-200" aria-hidden="true"/>
                  
                  <div className="max-h-[150px] overflow-y-auto">
                      {poi.timestamps && poi.timestamps.length > 0 ? (
                          <>
                              <span className="font-bold text-gray-600 uppercase text-xs" id={`scenes-label-${poi.id}`}>Scènes clés :</span>
                              <ul className="list-none p-0 m-0" role="list" aria-labelledby={`scenes-label-${poi.id}`}>
                                {poi.timestamps.map((scene) => (
                                  <li key={`${scene.time}-${scene.scene_fr}`}>
                                    <button 
                                        onClick={() => onPoiClick(parseTime(scene.time))}
                                        className="block w-full text-left bg-gray-50 border border-gray-200 rounded p-2 mt-1 hover:bg-indigo-50 hover:border-indigo-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        aria-label={`Aller à ${scene.time}: ${scene.scene_fr}`}
                                    >
                                        <span className="font-bold text-indigo-600" aria-hidden="true">▶ {scene.time}</span>
                                        <br/>
                                        <span className="text-xs text-gray-600 font-normal">
                                            {scene.scene_fr}
                                        </span>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                          </>
                      ) : (
                          <em className="text-sm text-gray-500 text-center block">Lieu général du film</em>
                      )}
                  </div>
                </div>
              </Popup>
            </Marker>
        ))}
      </MapContainer>
    </div>
  );
}