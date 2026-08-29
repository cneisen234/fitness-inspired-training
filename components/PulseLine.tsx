// The signature "Fitness Inspired" motif: a heartbeat / EKG line. It runs flat,
// spikes through a strong beat, and settles — the pulse of training. Used as a
// section transition and as a hero accent. Purely decorative.
//
// `PulseMark` is the compact logo glyph: the same beat inside a rounded badge,
// standing in as the brand mark until Ashley has a proper logo. Both are built
// from a single SVG path so they render crisp at any size and can draw
// themselves in (respecting prefers-reduced-motion via the .pulse-draw class).

type PulseLineProps = {
  color?: string;
  className?: string;
  height?: number;
  /** Animate the line drawing itself in on mount. */
  draw?: boolean;
  strokeWidth?: number;
};

// A clean single-beat EKG across a 240×40 viewBox.
const BEAT_PATH =
  "M0 20 H88 l6 -13 l7 26 l6 -20 l5 7 H140 l6 -18 l8 30 l5 -12 H240";

export function PulseLine({
  color = "var(--coral)",
  className = "",
  height = 40,
  draw = false,
  strokeWidth = 3,
}: PulseLineProps) {
  return (
    <div aria-hidden="true" className={className} style={{ lineHeight: 0 }}>
      <svg
        viewBox="0 0 240 40"
        width="100%"
        height={height}
        preserveAspectRatio="none"
        role="presentation"
        style={{ display: "block", width: "100%", height }}
      >
        <path
          d={BEAT_PATH}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className={draw ? "pulse-draw" : undefined}
          style={draw ? ({ strokeDasharray: 900, "--dash": "900" } as React.CSSProperties) : undefined}
        />
      </svg>
    </div>
  );
}

type PulseMarkProps = {
  size?: number;
  className?: string;
  /** Gently pulse the center beat. */
  animate?: boolean;
};

// The rounded-badge logo glyph: deep-blue tile, coral heartbeat across it.
export function PulseMark({ size = 44, className = "", animate = false }: PulseMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: size * 0.28,
        backgroundColor: "var(--sky-deep)",
        border: "2px solid var(--ink)",
        boxShadow: "2px 2px 0 var(--ink)",
        flexShrink: 0,
      }}
    >
      <svg viewBox="0 0 40 40" width={size * 0.66} height={size * 0.66} role="presentation">
        <path
          d="M2 22 H13 l3 -9 l4 18 l3 -13 l2 4 H38"
          fill="none"
          stroke="#fff"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="30" cy="12" r="3.4" fill="var(--coral)" className={animate ? "beat" : undefined} style={{ transformOrigin: "30px 12px" }} />
      </svg>
    </span>
  );
}
