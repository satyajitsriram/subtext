import Link from "next/link";
import { BrandMark } from "@/components/Brand";

export default function Home() {
  return (
    <main className="relative min-h-[100dvh] px-6 pt-12 pb-[120px]">
      <div className="mx-auto w-full max-w-md">
        <header className="text-center">
          <div className="mx-auto mb-4 mt-6 w-[220px] h-[220px] relative">
            <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(120%_100%_at_50%_0%,rgba(255,255,255,0.06),transparent_70%),repeating-linear-gradient(135deg,rgba(255,255,255,0.03)_0_8px,rgba(0,0,0,0.02)_8px_16px),linear-gradient(180deg,var(--surface),var(--muted-surface))] shadow-[0_18px_40px_rgba(0,0,0,0.45)] border border-white/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <BrandMark size={136} />
            </div>
          </div>
          <h1 className="heading text-5xl font-semibold text-foreground tracking-wide">Subtext</h1>
          <p className="mt-3 text-base text-muted-foreground">A sleek pass‑and‑play social deduction word game</p>
        </header>
        <section className="mt-6 grid gap-3">
          <div className="card p-4 text-sm text-foreground/90">
            <p>Gather your friends, pass the phone, reveal your secret word, and outwit the infiltrators.</p>
          </div>
          <nav className="grid gap-2">
            <Link href="/leaderboard" className="btn-secondary text-center">Leaderboard</Link>
            <Link href="/rules" className="btn-secondary text-center">How to play</Link>
          </nav>
        </section>
      </div>
      <div className="action-bar">
        <Link href="/play" className="btn-primary text-center">Start</Link>
      </div>
    </main>
  );
}
