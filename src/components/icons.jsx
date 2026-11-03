const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
};

export const FlagIcon = (p) => (
  <svg {...base} {...p}><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></svg>
);
export const ChevronRight = (p) => (
  <svg {...base} {...p}><path d="m9 6 6 6-6 6" /></svg>
);
export const ChevronLeft = (p) => (
  <svg {...base} {...p}><path d="m15 6-6 6 6 6" /></svg>
);
export const SearchIcon = (p) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const PersonIcon = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
);
export const DoorIcon = (p) => (
  <svg {...base} {...p}><path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17M3 21h18M14 12h.01" /></svg>
);
export const CheckIcon = (p) => (
  <svg {...base} {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);
export const PlayIcon = (p) => (
  <svg {...base} {...p}><path d="M8 5.5v13l10.5-6.5z" /></svg>
);
export const PauseIcon = (p) => (
  <svg {...base} {...p}><path d="M9 5v14M15 5v14" /></svg>
);
export const ClockIcon = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
);
export const CircleIcon = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="8" strokeDasharray="3 3" /></svg>
);
export const InfoIcon = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
);
export const CloseIcon = (p) => (
  <svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const SignOutIcon = (p) => (
  <svg {...base} {...p}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11" /></svg>
);

export const CameraIcon = (p) => (
  <svg {...base} {...p}><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
);

export const MessageIcon = (p) => (
  <svg {...base} {...p}><path d="M4.5 19.5 6 16a7.5 7.5 0 1 1 3 2.6z" /></svg>
);
export const MyWorkIcon = (p) => (
  <svg {...base} {...p}><path d="m3.5 6.5 1.5 1.5 3-3M3.5 13.5 5 15l3-3M11 6.5h9.5M11 13h9.5M5 19.5h15.5" /></svg>
);

export function PriorityIcon({ level }) {
  const filled = { Low: 1, Medium: 2, High: 3 }[level];
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={1 + i * 4.5}
          y={9 - i * 3.5}
          width="3"
          height={4 + i * 3.5}
          rx="1"
          fill="currentColor"
          opacity={i < filled ? 1 : 0.28}
        />
      ))}
    </svg>
  );
}
