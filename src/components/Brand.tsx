"use client";
export function BrandMark({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e0b211" />
          <stop offset="100%" stopColor="#9a770e" />
        </linearGradient>
      </defs>
      <rect rx="14" ry="14" x="2" y="2" width="60" height="60" fill="url(#g)" />
      <path
        d="M18 20h28l-6 8H24l-6-8zm2 16h24l-7 8H27l-7-8z"
        fill="#0b0f14"
        fillRule="evenodd"
      />
    </svg>
  );
}
