export function ShurikenIcon({ className = 'w-6 h-6' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`transition-all duration-500 ease-out group-hover:rotate-[360deg] group-hover:scale-120 group-active:rotate-[720deg] ${className}`}
    >
      <path d="M12 1L14.6 9.4L23 12L14.6 14.6L12 23L9.4 14.6L1 12L9.4 9.4L12 1Z" />
      <circle cx="12" cy="12" r="3.2" fill="var(--bg-app)" />
    </svg>
  );
}

export function KunaiIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-all duration-300 ease-out group-hover:translate-x-1.5 group-hover:-translate-y-1.5 group-hover:scale-110 group-active:translate-x-2.5 ${className}`}
    >
      <polygon points="19 5 12 7 7 12 5 19 12 17 17 12" fill="currentColor" fillOpacity="0.4" />
      <line x1="5" y1="19" x2="3" y2="21" strokeWidth="2.5" />
      <circle cx="2.5" cy="21.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function KatanaIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-all duration-300 ease-out group-hover:rotate-[22deg] group-hover:scale-115 group-active:rotate-[35deg] ${className}`}
    >
      {/* Curved Katana Blade */}
      <path d="M21 3C18 3 7 10 3 21" strokeWidth="2.4" />
      <path d="M21 3C17 5 9 12 5 19" fill="currentColor" fillOpacity="0.3" />
      {/* Tsuba Handguard */}
      <line x1="16.5" y1="6.5" x2="18.5" y2="8.5" strokeWidth="3" stroke="currentColor" />
      {/* Tsuka Grip */}
      <line x1="18" y1="6" x2="22" y2="2" strokeWidth="3.2" />
    </svg>
  );
}

export function ScrollIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-all duration-300 ease-out group-hover:scale-115 group-hover:-translate-y-0.5 ${className}`}
    >
      <path d="M19 17V5a2 2 0 0 0-2-2H4" />
      <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
      <line x1="10" y1="9" x2="16" y2="9" />
      <line x1="10" y1="13" x2="14" y2="13" />
    </svg>
  );
}

export function DojoIcon({ className = 'w-6 h-6' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-all duration-300 ease-out group-hover:scale-120 group-hover:-translate-y-0.5 ${className}`}
    >
      {/* Curved Upper Lintel Roof */}
      <path d="M2 5C6 4 18 4 22 5" strokeWidth="2.5" />
      <path d="M4 8H20" strokeWidth="2" />
      {/* Dual Dojo Pillars */}
      <line x1="6.5" y1="8" x2="6.5" y2="21" strokeWidth="2.2" />
      <line x1="17.5" y1="8" x2="17.5" y2="21" strokeWidth="2.2" />
      {/* Central Plaque / Torii Gate Center Ring */}
      <rect x="10.5" y="8" width="3" height="4" fill="currentColor" fillOpacity="0.3" />
      <circle cx="12" cy="15" r="2" fill="currentColor" />
    </svg>
  );
}
