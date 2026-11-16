/** Үкі — owl mascot. The үкі feather is a traditional Kazakh protective amulet. */
export function Owl({ size = 96, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden>
      <path d="M60 4 C64 14 70 18 76 20 C70 22 64 20 60 14 Z" fill="#fff" stroke="#f2b705" strokeWidth="2" />
      <path d="M22 34 L30 12 L44 28 Z" fill="#0a3f73" />
      <path d="M98 34 L90 12 L76 28 Z" fill="#0a3f73" />
      <ellipse cx="60" cy="68" rx="42" ry="46" fill="#0e5fa8" />
      <ellipse cx="60" cy="82" rx="26" ry="28" fill="#cfe3f5" />
      <path d="M44 78 q4 4 8 0 M56 86 q4 4 8 0 M68 78 q4 4 8 0 M50 96 q4 4 8 0 M62 96 q4 4 8 0" stroke="#0e5fa8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="42" cy="50" r="17" fill="#fff" />
      <circle cx="78" cy="50" r="17" fill="#fff" />
      <circle cx="44" cy="52" r="8" fill="#14263b" />
      <circle cx="76" cy="52" r="8" fill="#14263b" />
      <circle cx="46" cy="49" r="2.5" fill="#fff" />
      <circle cx="78" cy="49" r="2.5" fill="#fff" />
      <path d="M54 62 L66 62 L60 72 Z" fill="#f2b705" />
    </svg>
  );
}

/** Қошқар мүйіз (ram horn) ornament band. */
export function Ornament({ className = "", color = "#f2b705" }: { className?: string; color?: string }) {
  return (
    <svg className={className} width="100%" height="18" aria-hidden>
      <defs>
        <pattern id={`orn-${color.slice(1)}`} width="36" height="18" patternUnits="userSpaceOnUse">
          <path
            d="M2 16 C2 6 10 2 14 6 C17 9 14 13 11 11 M34 16 C34 6 26 2 22 6 C19 9 22 13 25 11 M14 6 L18 16 L22 6"
            stroke={color}
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
        </pattern>
      </defs>
      <rect width="100%" height="18" fill={`url(#orn-${color.slice(1)})`} />
    </svg>
  );
}
