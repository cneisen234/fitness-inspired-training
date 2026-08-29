// Brand marks built from Ashley's real logo.
//
// The logo she provided is stark black line-art on a transparent background.
// To make it live comfortably on a colorful site, we render the cropped
// fist-and-dumbbell emblem (public/FIT-Emblem.png) as a CSS *mask* — the PNG's
// alpha becomes the shape and we paint any brand color behind it. Same emblem,
// any color, crisp at any size.
//
//  • EmblemBadge — the emblem in white on a deep-blue kinetic tile (nav/footer).
//  • Emblem      — the free-standing emblem in a color you pass (placeholders,
//                  watermarks).

const EMBLEM_URL = '/FIT-Emblem.png';
const EMBLEM_RATIO = 646 / 416; // intrinsic width / height of the transparent crop

function maskStyle(color: string): React.CSSProperties {
  return {
    backgroundColor: color,
    WebkitMaskImage: `url(${EMBLEM_URL})`,
    maskImage: `url(${EMBLEM_URL})`,
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
  };
}

type EmblemBadgeProps = { size?: number; className?: string };

// Rounded deep-blue tile with the white fist emblem inside — the compact logo
// mark for the nav and footer. Mirrors the kinetic tile shadow used elsewhere.
export function EmblemBadge({ size = 44, className = '' }: EmblemBadgeProps) {
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: size * 0.28,
        backgroundColor: 'var(--sky-deep)',
        border: '2px solid var(--ink)',
        boxShadow: '2px 2px 0 var(--ink)',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          display: 'block',
          width: size * 0.68,
          height: (size * 0.68) / EMBLEM_RATIO,
          ...maskStyle('#fff'),
        }}
      />
    </span>
  );
}

type EmblemProps = {
  width?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
};

// The free-standing emblem, recolored to whatever you pass. Height derives from
// the emblem's intrinsic aspect ratio.
export function Emblem({ width = 160, color = 'var(--sky-deep)', className = '', style }: EmblemProps) {
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        display: 'inline-block',
        width,
        height: width / EMBLEM_RATIO,
        ...maskStyle(color),
        ...style,
      }}
    />
  );
}
