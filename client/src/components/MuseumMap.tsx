import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Museum {
  id: number;
  name: string;
  province: string;
  city: string;
  lat: number;
  lng: number;
  description: string;
  address: string;
}

interface MuseumMapProps {
  onMuseumSelect?: (museum: Museum) => void;
}

const createAggregateIcon = (count: number) => {
  const html = `
    <div style="
      width: 40px;
      height: 40px;
      background: #f97316;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      cursor: pointer;
      transition: transform 0.2s;
    ">
      ${count}
    </div>
  `;
  return L.divIcon({
    html,
    className: 'aggregate-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const createMuseumIcon = () => {
  const html = `
    <div style="
      width: 24px;
      height: 24px;
      background: #f97316;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 0 2px #1e40af, 0 2px 8px rgba(0,0,0,0.3);
      animation: pulse 1.5s infinite;
    "></div>
  `;
  return L.divIcon({
    html,
    className: 'museum-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

function MapController({ zoomLevel, onZoomChange }: { zoomLevel: number; onZoomChange: (z: number) => void }) {
  const map = useMap();

  useEffect(() => {
    const handleZoom = () => {
      onZoomChange(map.getZoom());
    };

    map.on('zoom', handleZoom);
    return () => {
      map.off('zoom', handleZoom);
    };
  }, [map, onZoomChange]);

  return null;
}

function AggregateMarker({ provinceName, museumList, count }: { provinceName: string; museumList: Museum[]; count: number }) {
  const markerRef = useRef<any>(null);
  const avgLat = museumList.reduce((sum, m) => sum + m.lat, 0) / museumList.length;
  const avgLng = museumList.reduce((sum, m) => sum + m.lng, 0) / museumList.length;

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setIcon(createAggregateIcon(count));
    }
  }, [count]);

  return (
    <Marker ref={markerRef} position={[avgLat, avgLng] as [number, number]}>
      <Popup>
        <div style={{ padding: '8px', maxWidth: '200px' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>{provinceName}</h3>
          <p style={{ fontSize: '12px', marginBottom: '8px', color: '#666' }}>
            航空博物馆数量: {count}
          </p>
          <div style={{ fontSize: '12px' }}>
            {museumList.map((museum) => (
              <div key={museum.id} style={{ marginBottom: '4px' }}>
                • {museum.name}
              </div>
            ))}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

function MuseumMarker({ museum, onSelect }: { museum: Museum; onSelect: (m: Museum) => void }) {
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setIcon(createMuseumIcon());
    }
  }, []);

  return (
    <Marker
      ref={markerRef}
      position={[museum.lat, museum.lng] as [number, number]}
      eventHandlers={{
        click: () => onSelect(museum),
      }}
    >
      <Popup>
        <div style={{ padding: '8px', maxWidth: '250px' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '14px', color: '#1e40af' }}>
            {museum.name}
          </h3>
          <p style={{ fontSize: '11px', marginBottom: '8px', color: '#666' }}>
            {museum.province} {museum.city}
          </p>
          <p style={{ fontSize: '12px', marginBottom: '8px', lineHeight: '1.4' }}>
            {museum.description}
          </p>
          <p style={{ fontSize: '11px', color: '#999' }}>
            📍 {museum.address}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

export default function MuseumMap({ onMuseumSelect }: MuseumMapProps) {
  const [museums, setMuseums] = useState<Museum[]>([]);
  const [provinces, setProvinces] = useState<Map<string, Museum[]>>(new Map());
  const [zoomLevel, setZoomLevel] = useState(4);
  const mapRef = useRef(null);

  useEffect(() => {
    const loadMuseums = async () => {
      try {
        const response = await fetch('/museums.json');
        const data = await response.json();
        setMuseums(data.museums);

        const grouped = new Map<string, Museum[]>();
        data.museums.forEach((museum: Museum) => {
          if (!grouped.has(museum.province)) {
            grouped.set(museum.province, []);
          }
          grouped.get(museum.province)!.push(museum);
        });
        setProvinces(grouped);
      } catch (error) {
        console.error('Failed to load museums:', error);
      }
    };

    loadMuseums();
  }, []);

  const handleMarkerClick = (museum: Museum) => {
    onMuseumSelect?.(museum);
  };

  const shouldShowAggregates = zoomLevel <= 5;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(30, 64, 175, 0.7), 0 2px 8px rgba(0,0,0,0.3);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(30, 64, 175, 0), 0 2px 8px rgba(0,0,0,0.3);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(30, 64, 175, 0), 0 2px 8px rgba(0,0,0,0.3);
          }
        }
      `}</style>
      <MapContainer
        center={[35.8617, 104.1954] as any}
        zoom={zoomLevel}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef as any}
        minZoom={3}
        maxZoom={10}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <MapController zoomLevel={zoomLevel} onZoomChange={setZoomLevel} />

        {shouldShowAggregates &&
          Array.from(provinces.entries()).map(([provinceName, museumList]) => (
            <AggregateMarker
              key={`province-${provinceName}`}
              provinceName={provinceName}
              museumList={museumList}
              count={museumList.length}
            />
          ))}

        {!shouldShowAggregates &&
          museums.map((museum) => (
            <MuseumMarker
              key={`museum-${museum.id}`}
              museum={museum}
              onSelect={handleMarkerClick}
            />
          ))}
      </MapContainer>

      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        backgroundColor: 'white',
        color: '#666',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        zIndex: 1000,
      }}>
        <p style={{ margin: '0 0 4px 0' }}>缩放级别: {zoomLevel}</p>
        <p style={{ margin: 0, color: '#999', fontSize: '11px' }}>
          {shouldShowAggregates ? '放大查看具体位置' : '显示具体博物馆位置'}
        </p>
      </div>

      <div style={{
        position: 'absolute',
        bottom: '0',
        right: '0',
        fontSize: '11px',
        color: '#999',
        padding: '8px',
        backgroundColor: 'rgba(255,255,255,0.8)',
        zIndex: 1000,
      }}>
        © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" style={{ color: '#1e40af', textDecoration: 'none' }}>OpenStreetMap</a> contributors
      </div>
    </div>
  );
}
