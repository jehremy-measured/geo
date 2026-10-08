type IconProps = { size?: number };

/** "Holdout" test type -- a plain no-entry/circle-slash glyph. */
export function NoEntryIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <line x1="6" y1="18" x2="18" y2="6" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

/** "Manual" implementation -- a simple open-hand glyph. */
export function HandIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 12V4a1.5 1.5 0 0 1 3 0v8M14 12V5a1.5 1.5 0 0 1 3 0v8M17 13v-2a1.5 1.5 0 0 1 3 0v6c0 3.31-2.69 6-6 6h-1a6 6 0 0 1-5.2-3l-2.4-4.16a1.5 1.5 0 0 1 2.52-1.62L9.5 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
