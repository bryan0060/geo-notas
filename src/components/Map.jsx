import { useRef, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { supabase } from '../supabaseClient';
import RadarPing from './RadarPing';

const OPENFREEMAP_DARK_STYLE = 'https://tiles.openfreemap.org/styles/dark';

export default function Map({ session, onMapClick }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const onMapClickRef = useRef(onMapClick);
  const markersRef = useRef({});
  const channelRef = useRef(null);
  const [coords, setCoords] = useState({ lng: -75.5812, lat: 6.1800 });
  const [zoom, setZoom] = useState(12.5);
  const [ready, setReady] = useState(false);

  // Siempre apuntar a la prop más reciente sin triggerear re-montaje del mapa
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  });

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

    // fetch existing notes (only from the last 24hs)
    const loadNotes = async () => {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('notas')
        .select('id, titulo, categoria, lat, lng, created_at')
        .order('created_at', { ascending: true })
        .gt('created_at', twentyFourHoursAgo);
      if (error) return;
      // Ignore if this map instance was already torn down (React StrictMode in dev)
      if (mapRef.current !== map) return;
      data.forEach(addMarker);
    };
    loadNotes();

    // realtime subscription
    const channel = supabase
      .channel('notas-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notas' },
        (payload) => {
          if (mapRef.current !== map) return;
          addMarker(payload.new);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED' && mapRef.current === map) {
          loadNotes();
        }
      });
    channelRef.current = channel;

    map.on('load', () => setReady(true));

    map.on('move', () => {
      const c = map.getCenter();
      setCoords({ lng: c.lng, lat: c.lat });
      setZoom(map.getZoom());
    });

    map.on('click', (e) => {
      onMapClickRef.current?.({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    });

    function addMarker(note) {
      if (markersRef.current[note.id]) return; // already added
      if (mapRef.current !== map) return;
      const el = document.createElement('div');
      el.className = 'note-marker';
      el.title = note.titulo; // hover tooltip
      // Use RadarPing component for animated pulse
      const pingContainer = document.createElement('div');
      pingContainer.style.position = 'relative';
      pingContainer.style.width = '24px';
      pingContainer.style.height = '24px';
      // Render RadarPing via ReactDOM? Since we're outside React, we'll replicate its style with CSS.
      // Simpler: reuse the .pulse-ring CSS but ensure it's correct.
      el.innerHTML = '<div class="pulse-ring"></div><div class="pulse-ring"></div><div class="pulse-ring"></div>';
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([note.lng, note.lat])
        .addTo(map);
      // optional popup on click
      const popup = new maplibregl.Popup({ offset: 12, closeButton: false, className: 'note-popup' })
        .setHTML(`<strong>${note.titulo}</strong><br/><span class="text-xs text-slate-400">${note.categoria}</span>`);
      marker.setPopup(popup);
      markersRef.current[note.id] = marker;
    }

    return () => {
      // remove markers
      Object.values(markersRef.current).forEach((m) => m.remove());
      markersRef.current = {};
      // unsubscribe realtime
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
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