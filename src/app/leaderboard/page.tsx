"use client";
import Link from "next/link";
import { useGame } from "@/lib/state";

export default function LeaderboardPage() {
  const { state, dispatch } = useGame();
  const players = [...state.players].sort((a, b) => b.score - a.score);
  return (
    <main className="min-h-[100dvh] px-4 py-6">
      <div className="mx-auto max-w-md space-y-4">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-sm underline underline-offset-4 text-foreground/80">
            Home
          </Link>
          <h1 className="heading text-xl">Leaderboard</h1>
          <div />
        </header>
        <div className="card p-4">
          <ol className="space-y-2">
            {players.map((p, i) => (
              <li key={p.id} className="flex items-center justify-between rounded bg-muted-surface px-3 py-2">
                <div>
                  <span className="mr-2 text-muted-foreground">#{i + 1}</span>
                  <span className="heading">{p.name}</span>
                </div>
                <div className="text-sm">{p.score}</div>
              </li>
            ))}
          </ol>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <button onClick={() => dispatch({ type: "RESET_ALL" })} className="tap-target w-full rounded-lg border border-danger/50 px-4 py-3 text-danger">
            Reset Session
          </button>
        </div>
      </div>
    </main>
  );
}
