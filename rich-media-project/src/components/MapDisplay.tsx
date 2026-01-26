'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useMemo } from 'react'; // Ajout de useMemo
import { POIEntry } from "@/app/types";
import { parseTime } from "@/app/utils";
import L from 'leaflet';

// Imports des images
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

export default function MapDisplay({ pois, onPoiClick }: { pois: POIEntry[], onPoiClick: (t: number) => void }) {
  const defaultCenter: [number, number] = [40.4406, -79.9959];

  // --- CORRECTION 1 : CRÉATION SÉCURISÉE DE L'ICÔNE ---
  // On utilise useMemo pour ne pas recréer l'objet à chaque rendu
  // On gère le cas où l'import Next.js renvoie un string OU un objet
  const customIcon = useMemo(() => {
    // Fonction utilitaire pour récupérer le chemin de l'image quel que soit le bundler
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
    <div style={{ height: '400px', width: '100%', marginTop: '20px', borderRadius:8, overflow:'hidden', border: '1px solid #ccc' }}>
      {/* L'erreur _leaflet_events vient souvent du fait que MapContainer essaie de se rendre 
         alors que ses enfants (Markers) plantent. 
         Si pois est vide ou undefined, on évite les problèmes.
      */}
      <MapContainer center={defaultCenter} zoom={9} style={{ height: '100%', width: '100%' }}>
        <TileLayer 
            attribution='&copy; OpenStreetMap' 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        />
        
        {pois && pois.map((poi) => (
            <Marker 
                key={poi.id} 
                position={[poi.latitude, poi.longitude]} 
                icon={customIcon} // On utilise notre icône sécurisée
            >
              <Popup>
                <strong>{poi.title_fr}</strong>
                <p style={{fontSize: '0.9em', margin: '5px 0'}}>{poi.description_fr}</p>
                
                <hr style={{margin: '5px 0', border: '0', borderTop: '1px solid #eee'}}/>
                
                <div style={{maxHeight: '150px', overflowY: 'auto'}}>
                    {poi.timestamps && poi.timestamps.length > 0 ? (
                        <>
                            <small style={{fontWeight:'bold', color:'#555'}}>Scènes clés :</small>
                            {poi.timestamps.map((scene, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => onPoiClick(parseTime(scene.time))}
                                    title="Aller à ce moment de la vidéo"
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        textAlign: 'left',
                                        background: '#f8f9fa',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        padding: '6px',
                                        marginTop: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.85em',
                                        color: '#0056b3'
                                    }}
                                >
                                    ▶ {scene.time}
                                    <br/>
                                    <span style={{color: '#333', fontWeight:'normal'}}>
                                        {scene.scene_fr}
                                    </span>
                                </button>
                            ))}
                        </>
                    ) : (
                        <em style={{fontSize: '0.8em', color: '#666', display:'block', textAlign:'center'}}>
                            Lieu de tournage général<br/>(Pas de scène spécifique)
                        </em>
                    )}
                </div>
              </Popup>
            </Marker>
        ))}
      </MapContainer>
    </div>
  );
}