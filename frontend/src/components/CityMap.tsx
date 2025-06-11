import React from 'react';
import Map, { Marker, NavigationControl, ScaleControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export interface TripLocation {
  id: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  status: string;
}

interface CityMapProps {
  /** Tu token de Mapbox */
  mapboxToken: string;
  /** Lista de viajes con coordenadas */
  trips: TripLocation[];
  /** Centro inicial [lng, lat] */
  initialCenter?: [number, number];
  /** Zoom inicial */
  initialZoom?: number;
}

export const CityMap: React.FC<CityMapProps> = ({
  mapboxToken,
  trips,
  initialCenter = [2.3522, 48.8566], // París por defecto
  initialZoom = 4,
}) => {
  return (
    <div style={{ width: '100%', height: '500px' }}>
      <Map
        initialViewState={{
          longitude: initialCenter[0],
          latitude: initialCenter[1],
          zoom: initialZoom,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={mapboxToken}
      >
        <NavigationControl position="top-right" />
        <ScaleControl position="bottom-right" />

        {trips.map((trip) => (
          <Marker
            key={trip.id}
            longitude={trip.longitude}
            latitude={trip.latitude}
            anchor="bottom"
          >
            <div
              style={{
                background: trip.status === 'Activo' ? '#22c55e' : 
                           trip.status === 'Próximo' ? '#3b82f6' : '#6b7280',
                borderRadius: '50%',
                width: '12px',
                height: '12px',
                border: '2px solid white',
                cursor: 'pointer',
              }}
              title={`${trip.name} - ${trip.city}, ${trip.country}`}
            />
          </Marker>
        ))}
      </Map>
    </div>
  );
}; 