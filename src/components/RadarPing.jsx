import { motion } from 'framer-motion';

export default function RadarPing({
  color = '#22D3EE',
  size = 80,
  className = '',
  rings = 3,
  duration = 2.5,
  dotSize = 0.15,
  glow = true
}) {
  const ringStyle = {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    border: `1.5px solid ${color}`,
    opacity: 0,
    transformOrigin: 'center',
  };

  const dotDiameter = size * dotSize;

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Radar pulse indicator"
    >
      {/* Central dot with glow */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: dotDiameter,
          height: dotDiameter,
          marginLeft: -dotDiameter / 2,
          marginTop: -dotDiameter / 2,
          borderRadius: '50%',
          backgroundColor: color,
          boxShadow: glow
            ? `0 0 ${size * 0.15} ${size * 0.03} ${color}, 0 0 ${size * 0.3} ${size * 0.05} ${color}66`
            : 'none',
          zIndex: 2,
        }}
        animate={{
          scale: [1, 1.15, 1],
          boxShadow: glow
            ? [
                `0 0 ${size * 0.15} ${size * 0.03} ${color}, 0 0 ${size * 0.3} ${size * 0.05} ${color}66`,
                `0 0 ${size * 0.25} ${size * 0.05} ${color}, 0 0 ${size * 0.5} ${size * 0.1} ${color}88`,
                `0 0 ${size * 0.15} ${size * 0.03} ${color}, 0 0 ${size * 0.3} ${size * 0.05} ${color}66`,
              ]
            : undefined,
        }}
        transition={{
          duration: duration * 0.8,
          repeat: Infinity,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      />

      {/* Expanding rings */}
      {Array.from({ length: rings }, (_, index) => (
        <motion.div
          key={index}
          style={ringStyle}
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{
            scale: 1.8,
            opacity: 0,
          }}
          transition={{
            duration,
            ease: [0.25, 0.46, 0.45, 0.94],
            repeat: Infinity,
            repeatDelay: 0.3,
            delay: index * (duration / rings),
          }}
        />
      ))}

      {/* Crosshair overlay for map feel - only on larger sizes */}
      {size > 60 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            opacity: 0.15,
          }}
        >
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '1px',
            background: `linear-gradient(90deg, transparent 30%, ${color} 50%, transparent 70%)`,
          }} />
          <div style={{
            position: 'absolute',
            width: '1px',
            height: '100%',
            background: `linear-gradient(180deg, transparent 30%, ${color} 50%, transparent 70%)`,
          }} />
        </div>
      )}
    </div>
  );
}