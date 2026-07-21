import { useRef, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { supabase } from '../supabaseClient';
import ReactionPopup from './ReactionPopup';

const OPENFREEMAP_DARK_STYLE = 'https://tiles.openfreemap.org/styles/dark';

export default function Map({ session, onMapClick, onLoginToast }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const onMapClickRef = useRef(onMapClick);
  const onLoginToastRef = useRef(onLoginToast);
  const sessionRef = useRef(session);
  const markersRef = useRef({});
  const channelRef = useRef(null);
  const reactionsChannelRef = useRef(null);
  const reactionCountsRef = useRef({});
  const myReactionsRef = useRef({});
  const rootsRef = useRef({});
  const popupsRef = useRef({});
  const optimisticNoteRef = useRef({});
  const [coords, setCoords] = useState({ lng: -75.5660, lat: 6.2445 });
  const [zoom, setZoom] = useState(12.5);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  useEffect(() => {
    onLoginToastRef.current = onLoginToast;
  }, [onLoginToast]);

  useEffect(() => {
    sessionRef.current = session;
    // Cuando cambia la sesión, refrescamos las reacciones propias
    if (session) {
      loadMyReactions();
    } else {
      myReactionsRef.current = {};
      refreshAllPopups();
    }
  }, [session]);

  async function loadMyReactions() {
    const noteIds = Object.keys(markersRef.current);
    if (noteIds.length === 0) return;
    const { data } = await supabase
      .from('reacciones')
      .select('nota_id, tipo')
      .eq('user_id', sessionRef.current.user.id)
      .in('nota_id', noteIds);
    const next = {};
    (data || []).forEach((r) => {
      next[r.nota_id] = r.tipo;
    });
    myReactionsRef.current = next;
    refreshAllPopups();
  }

  function refreshAllPopups() {
    Object.keys(popupsRef.current).forEach((noteId) => {
      renderPopup(noteId);
    });
  }

  function renderPopup(noteId, opts = {}) {
    const popup = popupsRef.current[noteId];
    if (!popup) return;
    const marker = markersRef.current[noteId];
    if (!marker) return;
    const note = marker._note;
    const counts = { ...(reactionCountsRef.current[noteId] || {}) };
    const myReaction = myReactionsRef.current[noteId] || null;
    const container = document.createElement('div');
    popup.setDOMContent(container);
    if (rootsRef.current[noteId]) {
      rootsRef.current[noteId].unmount();
    }
    const root = createRoot(container);
    rootsRef.current[noteId] = root;
    root.render(
      <ReactionPopup
        note={note}
        counts={counts}
        myReaction={myReaction}
        onReact={(tipo) => handleReact(noteId, tipo)}
        animateTo={opts.animateTo || null}
      />
    );
  }

  async function resyncNote(noteId) {
    const userId = sessionRef.current?.user.id;
    const { data } = await supabase
      .from('reacciones')
      .select('nota_id, tipo, user_id')
      .eq('nota_id', noteId);
    if (!reactionCountsRef.current[noteId]) reactionCountsRef.current[noteId] = {};
    const freshCounts = {};
    let mine = null;
    (data || []).forEach((r) => {
      freshCounts[r.tipo] = (freshCounts[r.tipo] || 0) + 1;
      if (userId && r.user_id === userId) mine = r.tipo;
    });
    reactionCountsRef.current[noteId] = freshCounts;
    myReactionsRef.current[noteId] = mine;
    renderPopup(noteId);
  }

  async function handleReact(noteId, tipo) {
    const sess = sessionRef.current;
    if (!sess) {
      onLoginToastRef.current?.('para reaccionar');
      return;
    }
    const userId = sess.user.id;
    const current = myReactionsRef.current[noteId];
    const actionType = current === tipo ? 'DELETE' : 'INSERT';

    // Optimistic update: feedback inmediato
    if (!reactionCountsRef.current[noteId]) reactionCountsRef.current[noteId] = {};
    const counts = reactionCountsRef.current[noteId];
    if (current === tipo) {
      counts[tipo] = Math.max(0, (counts[tipo] || 0) - 1);
      myReactionsRef.current[noteId] = null;
    } else {
      if (current && counts[current] !== undefined) {
        counts[current] = Math.max(0, (counts[current] || 0) - 1);
      }
      counts[tipo] = (counts[tipo] || 0) + 1;
      myReactionsRef.current[noteId] = tipo;
    }
    renderPopup(noteId, { animateTo: current === tipo ? null : tipo });

    // Guard: evitar que Realtime duplique nuestra propia acción
    optimisticNoteRef.current[noteId] = { eventType: actionType, userId, tipo };

    // Persistir en Supabase
    if (current === tipo) {
      await supabase
        .from('reacciones')
        .delete()
        .match({ nota_id: noteId, user_id: userId });
    } else {
      await supabase
        .from('reacciones')
        .upsert(
          { nota_id: noteId, user_id: userId, tipo },
          { onConflict: 'nota_id,user_id' }
        );
    }

    // Re-sincronizar desde Supabase, y AHORA sí limpiar el guard
    // (el guard sigue activo hasta que la re-sync confirma el estado real)
    await resyncNote(noteId);
    optimisticNoteRef.current[noteId] = null;
  }

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const VALLE_DE_ABURRA_BOUNDS = [
      [-75.68, 6.12],
      [-75.48, 6.37],
    ];

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: OPENFREEMAP_DARK_STYLE,
      center: [coords.lng, coords.lat],
      zoom: zoom,
      maxBounds: VALLE_DE_ABURRA_BOUNDS,
      minZoom: 10,
      maxZoom: 18,
      attributionControl: true,
      hash: true,
    });

    mapRef.current = map;

    const loadNotes = async () => {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('notas')
        .select('id, titulo, categoria, lat, lng, created_at')
        .order('created_at', { ascending: true })
        .gt('created_at', twentyFourHoursAgo);
      if (error) return;
      if (mapRef.current !== map) return;
      data.forEach(addMarker);
      await loadReactionCounts(data.map((n) => n.id));
    };

    async function loadReactionCounts(noteIds) {
      if (noteIds.length === 0) return;
      const { data, error } = await supabase
        .from('reacciones')
        .select('nota_id, tipo, user_id')
        .in('nota_id', noteIds);
      if (error) return;
      const counts = {};
      const mine = {};
      const sess = sessionRef.current;
      (data || []).forEach((r) => {
        if (!counts[r.nota_id]) counts[r.nota_id] = {};
        counts[r.nota_id][r.tipo] = (counts[r.nota_id][r.tipo] || 0) + 1;
        if (sess && r.user_id === sess.user.id) {
          mine[r.nota_id] = r.tipo;
        }
      });
      reactionCountsRef.current = counts;
      myReactionsRef.current = mine;
      refreshAllPopups();
    }

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

    const reactionsChannel = supabase
      .channel('reacciones-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reacciones' },
        (payload) => {
          applyReactionEvent(payload);
        }
      )
      .subscribe();
    reactionsChannelRef.current = reactionsChannel;

    function applyReactionEvent(payload) {
      const { eventType, record, old } = payload;
      const noteId = record?.nota_id || old?.nota_id;
      if (!noteId) return;

      // Guard basado en identidad: ignorar si coincide exacto con la última acción optimista
      const lastOptimistic = optimisticNoteRef.current[noteId];
      if (lastOptimistic) {
        const sameUser = (record?.user_id || old?.user_id) === lastOptimistic.userId;
        if (eventType === 'INSERT' && lastOptimistic.eventType === 'INSERT' && sameUser && record?.tipo === lastOptimistic.tipo) {
          optimisticNoteRef.current[noteId] = null;
          return;
        }
        if (eventType === 'DELETE' && lastOptimistic.eventType === 'DELETE' && sameUser && (old?.tipo) === lastOptimistic.tipo) {
          optimisticNoteRef.current[noteId] = null;
          return;
        }
        if (eventType === 'UPDATE' && sameUser && old?.tipo === lastOptimistic.tipo && record?.tipo === lastOptimistic.tipo) {
          optimisticNoteRef.current[noteId] = null;
          return;
        }
      }

      if (eventType === 'INSERT') {
        const { nota_id, tipo, user_id } = record;
        if (!reactionCountsRef.current[nota_id]) reactionCountsRef.current[nota_id] = {};
        reactionCountsRef.current[nota_id][tipo] =
          (reactionCountsRef.current[nota_id][tipo] || 0) + 1;
        const sess = sessionRef.current;
        if (sess && user_id === sess.user.id) {
          myReactionsRef.current[nota_id] = tipo;
        }
        renderPopup(nota_id);
      } else if (eventType === 'UPDATE') {
        const { nota_id, tipo, user_id } = record;
        const oldTipo = old?.tipo;
        if (oldTipo) {
          if (!reactionCountsRef.current[nota_id]) reactionCountsRef.current[nota_id] = {};
          reactionCountsRef.current[nota_id][oldTipo] = Math.max(
            0,
            (reactionCountsRef.current[nota_id][oldTipo] || 0) - 1
          );
        }
        if (!reactionCountsRef.current[nota_id]) reactionCountsRef.current[nota_id] = {};
        reactionCountsRef.current[nota_id][tipo] =
          (reactionCountsRef.current[nota_id][tipo] || 0) + 1;
        const sess = sessionRef.current;
        if (sess && user_id === sess.user.id) {
          myReactionsRef.current[nota_id] = tipo;
        }
        renderPopup(nota_id);
      } else if (eventType === 'DELETE') {
        const { nota_id, tipo, user_id } = old || record || {};
        if (nota_id && tipo) {
          if (reactionCountsRef.current[nota_id]) {
            reactionCountsRef.current[nota_id][tipo] = Math.max(
              0,
              (reactionCountsRef.current[nota_id][tipo] || 0) - 1
            );
          }
          const sess = sessionRef.current;
          if (sess && user_id === sess.user.id) {
            myReactionsRef.current[nota_id] = null;
          }
          renderPopup(nota_id);
        }
      }
    }

    map.on('load', () => setReady(true));

    map.on('move', () => {
      const c = map.getCenter();
      setCoords({ lng: c.lng, lat: c.lat });
      setZoom(map.getZoom());
    });

    map.on('click', (e) => {
      const target = e.originalEvent?.target;
      if (target?.closest('.note-marker, .maplibregl-popup')) return;
      onMapClickRef.current?.({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    });

    function addMarker(note) {
      if (markersRef.current[note.id]) return;
      if (mapRef.current !== map) return;
      const el = document.createElement('div');
      el.className = 'note-marker';
      el.title = note.titulo;
      el.innerHTML =
        '<div class="pulse-ring"></div><div class="pulse-ring"></div><div class="pulse-ring"></div>';
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([note.lng, note.lat])
        .addTo(map);

      marker._note = note;

      const popup = new maplibregl.Popup({
        offset: 12,
        closeButton: false,
        className: 'note-popup',
      }).setLngLat([note.lng, note.lat]);

      popupsRef.current[note.id] = popup;
      marker.setPopup(popup);

      popup.on('open', () => {
        renderPopup(note.id);
      });

      popup.on('close', () => {
        if (rootsRef.current[note.id]) {
          rootsRef.current[note.id].unmount();
          delete rootsRef.current[note.id];
        }
      });

      markersRef.current[note.id] = marker;
    }

    return () => {
      Object.values(rootsRef.current).forEach((r) => r.unmount());
      rootsRef.current = {};
      Object.values(popupsRef.current).forEach((p) => p.remove());
      popupsRef.current = {};
      Object.values(markersRef.current).forEach((m) => m.remove());
      markersRef.current = {};
      reactionCountsRef.current = {};
      myReactionsRef.current = {};
      optimisticNoteRef.current = {};
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (reactionsChannelRef.current) {
        supabase.removeChannel(reactionsChannelRef.current);
        reactionsChannelRef.current = null;
      }
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCoord = (val) => val.toFixed(4);

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainer}
        className="absolute inset-0 w-full h-full"
        style={{ background: '#0B1120' }}
      />

      <div className="absolute top-4 left-4 z-10 pointer-events-none font-mono">
          <div className="bg-[#0B1120]/80 backdrop-blur-md border border-[#1E293B] rounded-lg px-3 py-2">
          <div className="flex items-center gap-1.5 text-[10px] text-[#64748B] uppercase tracking-wider mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] animate-pulse" />
            POSICIÓN
          </div>
          <div className="flex flex-col gap-1 text-xs text-[#CBD5E1] tabular-nums">
            <div className="flex items-center gap-1.5">
              <span className="text-[#475569]">lat</span>
              <span>{formatCoord(coords.lat)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#475569]">lng</span>
              <span>{formatCoord(coords.lng)}</span>
            </div>
          </div>
        </div>

        <div className="mt-2 inline-flex items-center gap-1.5 bg-[#0B1120]/80 backdrop-blur-md border border-[#1E293B] rounded-lg px-2.5 py-1.5">
          <span className="text-[10px] text-[#475569] uppercase tracking-wider">zoom</span>
          <span className="text-xs text-[#CBD5E1] tabular-nums">{zoom.toFixed(1)}</span>
        </div>

        <div className="mt-2 bg-[#0B1120]/80 backdrop-blur-md border border-[#F59E0B]/30 rounded-lg px-3 py-2">
          <span className="text-xs text-[#F59E0B] font-semibold tracking-wide">Aviso: las notas expiran en 24 h</span>
        </div>

        <div className="mt-2 bg-[#0B1120]/80 backdrop-blur-md border border-[#22D3EE]/30 rounded-lg px-3 py-2 max-w-[220px]">
          <div className="text-[10px] text-[#22D3EE] uppercase tracking-wider mb-1.5 font-semibold">Guía rápida</div>
          <div className="space-y-1 text-[11px] text-[#67E8F9] leading-snug">
            <div>Toca el mapa para crear una nota</div>
            <div>Toca una nota para reaccionar</div>
            <div>Inicia sesión para participar</div>
          </div>
        </div>
      </div>

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0B1120]">
          <div className="font-mono text-xs text-[#475569] uppercase tracking-wider">
            Cargando mapa…
          </div>
        </div>
      )}

      <div className="absolute bottom-3 left-3 z-10 pointer-events-none font-mono text-[10px] leading-relaxed">
        <div className="text-[#E5E7EB]">Bryan Arias Ríos · ©2026</div>
        <div className="text-[#94A3B8]">Map tiles by <a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#CBD5E1] pointer-events-auto transition-colors">OpenFreeMap</a></div>
      </div>
    </div>
  );
}
