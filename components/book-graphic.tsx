type BookGraphicProps = {
  className?: string;
};

const LEFT_PAGE_LINES = [92, 116, 140, 164, 188, 212, 236, 260];
const RIGHT_PAGE_LINES = [92, 116, 140, 164, 188, 212, 236, 260];

export function BookGraphic({ className = "h-full w-full" }: BookGraphicProps) {
  return (
    <svg
      viewBox="0 0 1200 380"
      className={className}
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="book-cover" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0c76b" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#e3aa35" stopOpacity="0.06" />
        </linearGradient>
        <radialGradient id="book-glow" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#f8dea0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f8dea0" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="600" cy="150" rx="320" ry="110" fill="url(#book-glow)" />

      <path
        d="M600 70 C 460 40 260 55 60 110 L60 330 C 260 280 460 268 600 300 Z"
        fill="url(#book-cover)"
        stroke="#f0c76b"
        strokeOpacity="0.55"
        strokeWidth="2"
      />
      <path
        d="M600 70 C 740 40 940 55 1140 110 L1140 330 C 940 280 740 268 600 300 Z"
        fill="url(#book-cover)"
        stroke="#f0c76b"
        strokeOpacity="0.55"
        strokeWidth="2"
      />

      <path d="M600 70 L600 300" stroke="#f8dea0" strokeOpacity="0.6" strokeWidth="2.5" />

      {LEFT_PAGE_LINES.map((y, i) => (
        <path
          key={`l-${y}`}
          d={`M${90 + i * 5} ${y} C 260 ${y - 10} 460 ${y - 18} 596 ${y + 8}`}
          stroke="#fdf0ca"
          strokeOpacity="0.18"
          strokeWidth="1"
          fill="none"
        />
      ))}
      {RIGHT_PAGE_LINES.map((y, i) => (
        <path
          key={`r-${y}`}
          d={`M${1110 - i * 5} ${y} C 940 ${y - 10} 740 ${y - 18} 604 ${y + 8}`}
          stroke="#fdf0ca"
          strokeOpacity="0.18"
          strokeWidth="1"
          fill="none"
        />
      ))}
    </svg>
  );
}
