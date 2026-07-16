import { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const OPENFREEMAP_DARK_STYLE = 'https://tiles.openfreemap.org/styles/dark';

export default function Map({ session, onMapClick }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [coords, setCoords] = useState({ lng: -75.5812, lat: 6.1800 });
  const [zoom, setZoom] = useState(12.5);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: OPENFREEMAP_DARK_STYLE,
      center: [coords.lng, coords.lat],
      zoom: zoom,
      attributionControl: true,
      hash: true,
    });

    mapRef.current = map;

    map.on('load', () => setReady(true));

    map.on('move', () => {
      const c = map.getCenter();
      setCoords({ lng: c.lng, lat: c.lat });
      setZoom(map.getZoom());
    });

    map.on('click', (e) => {
      onMapClick?.({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCoord = (val) => val.toFixed(4);

  return (
    <div className="relative w-full h-full">
      {/* Map container */}
      <div
        ref={mapContainer}
        className="absolute inset-0 w-full h-full"
        style={{ background: '#0B1120' }}
      />

      {/* HUD top-left: coordinates + zoom */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none font-mono">
        <div className="bg-[#0B1120]/80 backdrop-blur-md border border-slate-800 rounded-lg px-3 py-2">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            POSICIÓN
          </div>
          <div className="flex flex-col gap-1 text-xs text-slate-300 tabular-nums">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600">lat</span>
              <span>{formatCoord(coords.lat)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600">lng</span>
              <span>{formatCoord(coords.lng)}</span>
            </div>
          </div>
        </div>

        {/* Zoom badge */}
        <div className="mt-2 inline-flex items-center gap-1.5 bg-[#0B1120]/80 backdrop-blur-md border border-slate-800 rounded-lg px-2.5 py-1.5">
          <span className="text-[10px] text-slate-600 uppercase tracking-wider">zoom</span>
          <span className="text-xs text-slate-300 tabular-nums">{zoom.toFixed(1)}</span>
        </div>
      </div>

      {/* Bottom-right: attribution is handled by MapLibre */}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0B1120]">
          <div className="font-mono text-xs text-slate-600 uppercase tracking-wider">
            Cargando mapa…
          </div>
        </div>
      )}
    </div>
  );
}