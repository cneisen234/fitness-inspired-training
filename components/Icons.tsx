// Small, consistent stroke icons for service + value cards. Each inherits the
// current text color via `stroke="currentColor"`, so color them with a wrapper.

type IconProps = { className?: string; size?: number };

function base(size: number, className: string) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
  };
}

export function DumbbellIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg {...base(size, className)} aria-hidden="true">
      <path d="M6.5 6.5l11 11" />
      <path d="M4 9l-1.5 1.5a1.5 1.5 0 000 2.1L4 14" transform="rotate(0)" />
      <rect x="2" y="8.5" width="3.2" height="7" rx="1" transform="rotate(-45 3.6 12)" />
      <rect x="18.8" y="8.5" width="3.2" height="7" rx="1" transform="rotate(-45 20.4 12)" />
      <rect x="6" y="6.6" width="2.4" height="10.8" rx="1" transform="rotate(-45 7.2 12)" />
      <rect x="15.6" y="6.6" width="2.4" height="10.8" rx="1" transform="rotate(-45 16.8 12)" />
    </svg>
  );
}

export function DeviceIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg {...base(size, className)} aria-hidden="true">
      <rect x="7" y="2.5" width="10" height="19" rx="2.4" />
      <path d="M10.5 18.5h3" />
      <path d="M9.5 7l1.6 1.6L14 5.7" />
    </svg>
  );
}

export function BlendIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg {...base(size, className)} aria-hidden="true">
      <circle cx="8.5" cy="12" r="5.5" />
      <circle cx="15.5" cy="12" r="5.5" />
    </svg>
  );
}

export function TargetIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg {...base(size, className)} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.6" />
    </svg>
  );
}

export function MedalIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg {...base(size, className)} aria-hidden="true">
      <circle cx="12" cy="14.5" r="5.5" />
      <path d="M12 12v2.5l1.6 1" />
      <path d="M8.5 9L6 3.5M15.5 9L18 3.5M9.5 6.5h5" />
    </svg>
  );
}

export function CheckIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg {...base(size, className)} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.2l2.6 2.6L16 9.4" />
    </svg>
  );
}

export function HeartIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg {...base(size, className)} aria-hidden="true">
      <path d="M12 20s-7-4.5-7-9.5A3.8 3.8 0 0112 7.5 3.8 3.8 0 0119 10.5c0 5-7 9.5-7 9.5z" />
    </svg>
  );
}

export function StarIcon({ className = '', size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.4l-5.81 3.06 1.11-6.47-4.7-4.58 6.5-.95z" />
    </svg>
  );
}

const ICONS = {
  dumbbell: DumbbellIcon,
  device: DeviceIcon,
  blend: BlendIcon,
  target: TargetIcon,
  medal: MedalIcon,
  check: CheckIcon,
  heart: HeartIcon,
  star: StarIcon,
};

export function Icon({ name, className = '', size = 24 }: { name: keyof typeof ICONS } & IconProps) {
  const C = ICONS[name];
  return <C className={className} size={size} />;
}
