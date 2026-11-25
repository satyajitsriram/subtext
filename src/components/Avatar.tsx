"use client";

const COLORS = [
  "#F59E0B", // amber
  "#3B82F6", // blue
  "#10B981", // emerald
  "#EF4444", // red
  "#8B5CF6", // violet
  "#F43F5E", // rose
  "#14B8A6", // teal
  "#84CC16", // lime
];

function pickColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

export function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  const initials = (name || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || "")
    .join("");
  const bg = pickColor(name);
  const style: React.CSSProperties = { width: size, height: size, backgroundColor: bg, color: "#0b0f14" };
  return (
    <span className="avatar" aria-hidden="true" style={style}>
      {initials}
    </span>
  );
}
