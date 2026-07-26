import { useMemo } from 'react';

// Star colors — mix white with colored tints for a more vivid look
const STAR_COLORS = [
  'rgba(255, 255, 255, VAR)',
  'rgba(165, 180, 252, VAR)', // indigo tint
  'rgba(196, 181, 253, VAR)', // violet tint
  'rgba(147, 197, 253, VAR)', // blue tint
  'rgba(110, 231, 183, VAR)', // emerald tint
  'rgba(249, 168, 212, VAR)', // pink tint
  'rgba(103, 232, 249, VAR)', // cyan tint
];

function useStars(count: number) {
  return useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const opacity = Math.random() * 0.7 + 0.2;
      const colorTemplate = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
      const color = colorTemplate.replace('VAR', opacity.toFixed(2));
      return {
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 2.8 + 0.4,
        dur: `${Math.random() * 5 + 1.5}s`,
        delay: `${Math.random() * 10}s`,
        opacity,
        color,
      };
    });
  }, [count]);
}

function useComets(count: number) {
  return useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      top: `${Math.random() * 50}%`,
      left: `${Math.random() * 70 - 10}%`,
      // Vary speed: some fast (2-3s) some slow (5-7s) for depth
      dur: `${Math.random() * 4 + 2}s`,
      delay: `${Math.random() * 18 + i * 3}s`,
    }));
  }, [count]);
}

export default function DynamicBackground() {
  const stars  = useStars(200);
  const comets = useComets(10);

  return (
    <>
      {/* Base aurora — layers 0, 1, 2 (::before / ::after) */}
      <div className="dynamic-bg" aria-hidden="true" />

      {/* Conic nebula corona */}
      <div className="nebula" aria-hidden="true" />

      {/* Pulsing dot grid */}
      <div className="bg-grid" aria-hidden="true" />

      {/* 8 Floating colour orbs */}
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />
      <div className="orb orb-4" aria-hidden="true" />
      <div className="orb orb-5" aria-hidden="true" />
      <div className="orb orb-6" aria-hidden="true" />
      <div className="orb orb-7" aria-hidden="true" />
      <div className="orb orb-8" aria-hidden="true" />

      {/* 200 twinkling colour stars */}
      <div className="stars" aria-hidden="true">
        {stars.map((s) => (
          <div
            key={s.id}
            className="star"
            style={{
              top: s.top,
              left: s.left,
              width: `${s.size}px`,
              height: `${s.size}px`,
              background: s.color,
              boxShadow: s.size > 2 ? `0 0 ${s.size * 2}px ${s.color}` : 'none',
              '--dur': s.dur,
              '--delay': s.delay,
              '--opacity': s.opacity,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* 10 Shooting comets at staggered intervals */}
      {comets.map((c) => (
        <div
          key={c.id}
          className="comet"
          style={{
            top: c.top,
            left: c.left,
            '--cdur': c.dur,
            '--cdelay': c.delay,
          } as React.CSSProperties}
          aria-hidden="true"
        />
      ))}
    </>
  );
}
