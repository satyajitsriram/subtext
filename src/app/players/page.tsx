"use client";
import { useGame } from "@/lib/state";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PlayersPage() {
  const { state, dispatch } = useGame();
  const [namesText, setNamesText] = useState<string>("");
  const router = useRouter();

  const handleInit = () => {
    const names = namesText
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (names.length >= 3 && names.length <= 20) {
      dispatch({ type: "INIT_PLAYERS", names });
    } else {
      alert("Enter between 3 and 20 player names (separated by commas or new lines).");
    }
  };

  return (
    <main className="min-h-[100dvh] px-4 py-6">
      <div className="mx-auto max-w-md space-y-6">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-sm underline underline-offset-4 text-foreground/80">
            Home
          </Link>
          <h1 className="heading text-xl">Players</h1>
          <div />
        </header>

        <div className="card p-4 space-y-3">
          <label className="block text-sm text-muted-foreground">Names (comma or newline separated)</label>
          <textarea
            className="w-full rounded-md bg-background border border-white/10 p-3 outline-none focus:ring-2 focus:ring-[--ring]"
            rows={6}
            placeholder="e.g. Alex, Bea, Chris..."
            value={namesText}
            onChange={(e) => setNamesText(e.target.value)}
          />
          <button onClick={handleInit} className="tap-target w-full rounded-md bg-accent px-4 py-2 font-medium text-black active:opacity-90">
            Save Players
          </button>
        </div>

        {state.players.length > 0 && (
          <div className="card p-4">
            <h2 className="heading mb-2 text-lg">Current</h2>
            <ul className="grid grid-cols-2 gap-2">
              {state.players.map((p) => (
                <li key={p.id} className="rounded bg-muted-surface px-3 py-2 text-sm">
                  {p.name} <span className="text-xs text-muted-foreground">({p.score})</span>
                </li>
              ))}
            </ul>
            <Link href="/setup" className="mt-4 inline-block w-full rounded-md border border-accent/40 px-4 py-2 text-center">
              Continue to Setup
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
