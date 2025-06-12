import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { checkMapboxSearchUsage, getMapboxUsage } from '../lib/mapbox';

export interface PlaceFeature {
  id: string;
  place_name: string;
  text: string;
  properties?: {
    short_code?: string;
  };
  center?: [number, number];
}

export interface PlaceAutocompleteProps {
  /** 'country' para autocompletar países, 'city' para autocompletar ciudades */
  type: 'country' | 'city';
  /** Cuando type==='city', código ISO alpha-2 o nombre de país completo */
  country?: string;
  /** Token de Mapbox */
  mapboxToken: string;
  /** Función callback al seleccionar un lugar */
  onSelect: (feature: PlaceFeature) => void;
  /** Valor actual del input */
  value: string;
  /** Placeholder del input */
  placeholder?: string;
}

export default function PlaceAutocomplete({
  type,
  country,
  mapboxToken,
  onSelect,
  value,
  placeholder,
}: PlaceAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [canUseMapbox, setCanUseMapbox] = useState(true);
  const [usageStats, setUsageStats] = useState({ mapLoads: 0, searches: 0 });
  const lastSelectedRef = useRef<string | null>(null);

  const fetchSuggestions = async (q: string) => {
    if (!q) {
      setSuggestions([]);
      return;
    }

    // Verificar límite de uso de búsquedas
    const canUse = await checkMapboxSearchUsage();
    const usage = await getMapboxUsage();
    
    console.log('PlaceAutocomplete - Usage check:', { canUse, usage });
    
    setCanUseMapbox(canUse);
    setUsageStats(usage);

    if (!canUse) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    const typesParam = type === 'country' ? 'country' : 'place';
    let baseUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json`;
    let params = new URLSearchParams({
      access_token: mapboxToken,
      types: typesParam,
      language: 'es',
      limit: '5',
    });

    if (type === 'city' && country) {
      let iso2 = country;
      if (country.length > 2) {
        try {
          const resp = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(country)}.json?` +
            `access_token=${mapboxToken}&types=country&language=es&limit=1`
          );
          const json = await resp.json();
          const code = json.features?.[0]?.properties?.short_code;
          if (code) iso2 = code;
        } catch {
          // si falla, dejamos iso2 = country (puede ser inválido)
        }
      }
      params.set('country', iso2.toLowerCase());
    }

    const url = `${baseUrl}?${params.toString()}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      setSuggestions(data.features || []);
    } catch (err) {
      console.error('Error fetching Mapbox:', err);
      setSuggestions([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Si query es justo lo que seleccioné, no vuelvo a fetch
    if (lastSelectedRef.current === query) {
      lastSelectedRef.current = null;
      return;
    }
    const timer = setTimeout(() => {
      fetchSuggestions(query);
    }, 250);
    return () => clearTimeout(timer);
  }, [query, country, type]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSelect = (feat: PlaceFeature) => {
    // marco mi selección y actualizo
    lastSelectedRef.current = feat.place_name;
    setQuery(feat.place_name);
    setSuggestions([]);
    onSelect(feat);
  };

  return (
    <div style={{ position: 'relative', maxWidth: 400 }}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => {
          // Reset de lastSelectedRef al enfocar el input
          lastSelectedRef.current = null;
        }}
        placeholder={type === 'country' ? 'Buscar país…' : 'Buscar ciudad…'}
        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
        disabled={!canUseMapbox}
      />
      {!canUseMapbox && (
        <div className="text-xs text-red-500 mt-1">
          Límite de búsquedas de Mapbox alcanzado ({usageStats.searches}/20,000)
        </div>
      )}
      {loading && <div style={{ position: 'absolute', top: 36 }}>Cargando…</div>}
      {!loading && suggestions.length > 0 && (
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            position: 'absolute',
            width: '100%',
            background: '#fff',
            border: '1px solid #ccc',
            maxHeight: 200,
            overflowY: 'auto',
            zIndex: 10,
          }}
        >
          {suggestions.map((feat) => (
            <li
              key={feat.id}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(feat);
              }}
              style={{ padding: '8px', cursor: 'pointer' }}
            >
              {feat.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
