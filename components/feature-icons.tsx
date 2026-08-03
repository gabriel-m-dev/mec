type IconProps = {
  className?: string;
};

export function UsersIcon({ className = "h-7 w-7" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="8.7" cy="8" r="2.6" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16.1" cy="8.7" r="2.1" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3.3 19c.4-3.3 2.7-5.1 5.4-5.1s5 1.8 5.4 5.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M14.9 14.2c2.1.2 3.8 1.9 4.2 4.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PodiumIcon({ className = "h-7 w-7" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M7 21 8.4 10h7.2L17 21"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M5.3 10h13.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="4.9" r="2.3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.2v2.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ShieldCrossIcon({ className = "h-7 w-7" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3.4 19 6v5.6c0 5-3 8-7 9.5-4-1.5-7-4.5-7-9.5V6l7-2.6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M12 9v6M9 12h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ServeHandsIcon({ className = "h-7 w-7" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 8.4c-1-1.6-2.6-2.6-4.3-2.2-2 .5-3 2.7-2.1 4.6.9 2 3.6 4.4 6.4 6.6 2.8-2.2 5.5-4.6 6.4-6.6.9-1.9-.1-4.1-2.1-4.6-1.7-.4-3.3.6-4.3 2.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M3.6 18.4c1.6-1.1 3-1.6 4.6-1.6h3.1c.9 0 1.6.7 1.6 1.6s-.7 1.6-1.6 1.6H8.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.4 18.4c-1.6-1.1-3-1.6-4.6-1.6h-1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
