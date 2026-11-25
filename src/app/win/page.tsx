"use client";
import { useGame } from "@/lib/state";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function WinPage() {
  const { state, dispatch } = useGame();
  const router = useRouter();
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (state.status !== "finished") {
      router.replace("/");
    }
    if (state.settings.soundsEnabled && typeof window !== "undefined") {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      // Quiet fanfare (two soft notes)
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.linearRampToValueAtTime(659.25, now + 0.18);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.05, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.42);
      return () => {
        ctx.close().catch(() => {});
      };
    }
  }, [state.status, router]);

  const winners = state.winners?.playerIds ?? [];
  const nameMap = new Map(state.players.map((p) => [p.id, p.name]));
  const group = state.winners?.group;

  return (
    <main className="min-h-[100dvh] px-4 py-6">
      <div className="mx-auto max-w-md space-y-4 text-center animate-pop">
        <h1 className="heading text-3xl">{group === "CIVILIANS" ? "Civilians Win!" : group === "MR_WHITE" ? "Mr. White Wins!" : "Infiltrators Win!"}</h1>
        <div className="card p-4">
          <h2 className="heading mb-2 text-lg">Winners</h2>
          <ul className="space-y-1">
            {winners.map((id) => (
              <li key={id}>{nameMap.get(id)}</li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => {
              dispatch({ type: "RESTART_SAME_PLAYERS" });
              router.push("/reveal");
            }}
            className="tap-target w-full rounded-lg bg-accent px-4 py-3 font-medium text-black"
          >
            Play Again
          </button>
          <Link href="/leaderboard" className="tap-target w-full rounded-lg border border-accent/40 px-4 py-3 text-center">
            Leaderboard
          </Link>
          <Link href="/" className="text-sm underline underline-offset-4 text-foreground/80">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
