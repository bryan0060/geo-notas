import { useState, useEffect } from 'react';

export const REACTION_TYPES = ['like', 'love', 'wow'];

export const REACTIONS = {
  like: { emoji: '👍', label: 'like' },
  love: { emoji: '❤️', label: 'love' },
  wow: { emoji: '😮', label: 'wow' },
};

export default function ReactionPopup({ note, counts, myReaction, onReact, animateTo }) {
  const [popping, setPopping] = useState(null);

  useEffect(() => {
    if (animateTo) {
      setPopping(animateTo);
      const t = setTimeout(() => setPopping(null), 400);
      return () => clearTimeout(t);
    }
  }, [animateTo, counts]);

  return (
    <div style={{ minWidth: '180px' }}>
      <div style={{ marginBottom: '8px' }}>
        <strong style={{ color: '#E5E7EB', fontSize: '14px' }}>{note.titulo}</strong>
        <br />
        <span style={{ color: '#94A3B8', fontSize: '11px' }}>{note.categoria}</span>
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        {REACTION_TYPES.map((tipo) => {
          const isActive = myReaction === tipo;
          const isPopping = popping === tipo;
          return (
            <button
              key={tipo}
              onClick={() => onReact(tipo)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '6px',
                border: `1px solid ${isActive ? '#22D3EE' : '#1E293B'}`,
                background: isActive ? 'rgba(34, 211, 238, 0.15)' : 'transparent',
                color: isActive ? '#22D3EE' : '#CBD5E1',
                fontSize: '13px',
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'border-color 0.15s, background 0.15s, color 0.15s, transform 0.15s',
                transform: isPopping ? 'scale(1.3)' : 'scale(1)',
              }}
            >
              <span style={{
                display: 'inline-block',
                transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                transform: isPopping ? 'scale(1.5)' : 'scale(1)',
              }}>
                {REACTIONS[tipo].emoji}
              </span>
              <span style={{ fontWeight: 600 }}>{counts[tipo] || 0}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
