/**
 * Logo RbxDaily (ikon kado = reward harian).
 * Gambar yang sama dengan app/icon.svg, sehingga logo di sidebar dan
 * ikon di tab browser selalu identik.
 */
export function BrandMark({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id="rbx-brand-bg"
          x1="8"
          y1="4"
          x2="56"
          y2="60"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#a78bff" />
          <stop offset="1" stopColor="#5b3de0" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill="url(#rbx-brand-bg)" />
      <path
        d="M32 24C26 24 19 22 19 17.5C19 13.5 24 12.5 27.5 15C30 16.8 31.5 20 32 24Z"
        fill="#fff"
      />
      <path
        d="M32 24C38 24 45 22 45 17.5C45 13.5 40 12.5 36.5 15C34 16.8 32.5 20 32 24Z"
        fill="#fff"
      />
      <rect x="12" y="24" width="40" height="11" rx="3" fill="#fff" />
      <path
        d="M15 37H49V50C49 52.2 47.2 54 45 54H19C16.8 54 15 52.2 15 50V37Z"
        fill="#fff"
        fillOpacity="0.93"
      />
      <rect x="28.5" y="24" width="7" height="30" fill="#6d4aff" />
    </svg>
  );
}
