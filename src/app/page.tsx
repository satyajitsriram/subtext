import Link from "next/link";
import { BrandMark } from "@/components/Brand";

export default function Home() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-md space-y-8">
        <header className="text-center">
          <div className="mb-2 flex justify-center">
            <BrandMark size={56} />
          </div>
          <h1 className="heading text-4xl font-semibold text-foreground">Subtext</h1>
          <p className="mt-2 text-sm text-muted-foreground">Pass-and-play social deduction word game</p>
        </header>
        <div className="card p-6 space-y-4">
          <Link href="/players" className="tap-target block w-full rounded-lg bg-accent px-4 py-3 text-center font-medium text-black active:opacity-90">
            Manage Players
          </Link>
          <Link href="/setup" className="tap-target block w-full rounded-lg border border-accent/40 px-4 py-3 text-center font-medium text-foreground hover:bg-accent/10 active:opacity-90">
            New Game
          </Link>
          <div className="pt-2 text-center text-xs text-muted-foreground">
            Offline-ready • Add to Home Screen • No ads, no tracking
          </div>
        </div>
        <nav className="text-center space-x-4">
          <Link href="/leaderboard" className="text-sm underline underline-offset-4 text-foreground/90">
            Leaderboard
          </Link>
          <Link href="/rules" className="text-sm underline underline-offset-4 text-foreground/70">
            Rules
          </Link>
          <Link href="/words" className="text-sm underline underline-offset-4 text-foreground/70">
            Custom Words
          </Link>
        </nav>
      </div>
    </main>
  );
}
