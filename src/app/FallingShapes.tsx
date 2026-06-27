type ShapeType = "bowl" | "circle" | "square" | "triangle";

type Shape = {
  type: ShapeType;
  color: string;
  size: number; // px
  left: number; // %
  fall: number; // s — vertical fall duration (smaller = faster/closer)
  sway: number; // s — horizontal wobble duration
  delay: number; // s
};

// Warm, tapas-inspired palette.
const COLORS = [
  "#E07A5F",
  "#F2CC8F",
  "#81B29A",
  "#E63946",
  "#F4A261",
  "#2A9D8F",
  "#E76F51",
  "#3D405B",
  "#F6BD60",
  "#84A59D",
];

// Deterministic config (no Math.random) so SSR and client markup match.
// Bigger shapes fall a touch faster → reads as "closer" (parallax depth).
const SHAPES: Shape[] = [
  { type: "bowl", color: COLORS[0], size: 60, left: 6, fall: 4.0, sway: 2.1, delay: 0 },
  { type: "circle", color: COLORS[1], size: 30, left: 15, fall: 6.2, sway: 2.8, delay: 1.2 },
  { type: "triangle", color: COLORS[2], size: 44, left: 23, fall: 4.8, sway: 1.9, delay: 2.4 },
  { type: "square", color: COLORS[3], size: 26, left: 31, fall: 6.6, sway: 3.0, delay: 0.6 },
  { type: "bowl", color: COLORS[4], size: 48, left: 40, fall: 4.4, sway: 2.3, delay: 3.0 },
  { type: "circle", color: COLORS[5], size: 64, left: 49, fall: 3.6, sway: 2.0, delay: 1.6 },
  { type: "square", color: COLORS[6], size: 22, left: 57, fall: 6.9, sway: 3.1, delay: 3.6 },
  { type: "bowl", color: COLORS[7], size: 56, left: 65, fall: 4.1, sway: 2.2, delay: 0.9 },
  { type: "triangle", color: COLORS[8], size: 30, left: 73, fall: 6.0, sway: 2.6, delay: 2.8 },
  { type: "circle", color: COLORS[9], size: 40, left: 81, fall: 5.2, sway: 2.4, delay: 1.0 },
  { type: "bowl", color: COLORS[2], size: 50, left: 89, fall: 4.6, sway: 2.1, delay: 2.0 },
  { type: "square", color: COLORS[0], size: 24, left: 11, fall: 6.8, sway: 3.2, delay: 4.0 },
  { type: "circle", color: COLORS[4], size: 18, left: 45, fall: 7.2, sway: 3.4, delay: 4.6 },
  { type: "triangle", color: COLORS[5], size: 38, left: 69, fall: 5.0, sway: 2.5, delay: 0.4 },
  { type: "bowl", color: COLORS[1], size: 34, left: 35, fall: 5.6, sway: 2.7, delay: 5.2 },
  { type: "circle", color: COLORS[6], size: 54, left: 78, fall: 3.9, sway: 2.0, delay: 3.3 },
];

function shapeStyle(s: Shape): React.CSSProperties {
  // Depth cue: bigger shapes cast a stronger shadow and sit more opaque.
  const depth = (s.size - 18) / (64 - 18); // 0..1
  const shadow = `drop-shadow(0 ${4 + depth * 8}px ${6 + depth * 8}px rgba(0,0,0,${(
    0.12 +
    depth * 0.18
  ).toFixed(2)}))`;

  const base: React.CSSProperties = {
    width: s.size,
    height: s.size,
    backgroundColor: s.color,
    filter: shadow,
  };

  switch (s.type) {
    case "circle":
      return { ...base, borderRadius: "9999px" };
    case "square":
      return { ...base, borderRadius: "8px" };
    case "bowl":
      // Flat top, rounded bottom — reads as a little bowl.
      return { ...base, height: s.size / 2, borderRadius: "0 0 9999px 9999px" };
    case "triangle":
      return {
        width: 0,
        height: 0,
        backgroundColor: "transparent",
        filter: shadow,
        borderLeft: `${s.size / 2}px solid transparent`,
        borderRight: `${s.size / 2}px solid transparent`,
        borderBottom: `${s.size}px solid ${s.color}`,
      };
  }
}

export default function FallingShapes() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {SHAPES.map((s, i) => (
        // Outer: vertical fall (accelerating).
        <span
          key={i}
          className="tapas-fall absolute top-0 block"
          style={{
            left: `${s.left}%`,
            animationDuration: `${s.fall}s`,
            animationDelay: `${s.delay}s`,
          }}
        >
          {/* Inner: horizontal wobble + tilt (the "톡톡" bounce). */}
          <span
            className="tapas-sway block"
            style={{
              animationDuration: `${s.sway}s`,
              animationDelay: `${s.delay}s`,
            }}
          >
            <span className="block" style={shapeStyle(s)} />
          </span>
        </span>
      ))}
    </div>
  );
}
