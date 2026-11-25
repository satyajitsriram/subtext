"use client";
import { useGame } from "@/lib/state";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkVictory } from "@/lib/engine";

export default function RoundPage() {
  const { state, dispatch } = useGame();
  const router = useRouter();

  useEffect(() => {
    if (state.status !== "in_round" || state.rounds.length === 0) {
      router.replace("/reveal");
    }
    const v = checkVictory(state);
    if (v) {
      dispatch({ type: "END_WITH_VICTORY", victory: v });
      router.replace("/win");
    }
  }, [state.status, state.rounds.length, router, state, dispatch]);

  const round = state.rounds[state.rounds.length - 1];
  const order = round?.speakingOrder ?? [];
  const nameMap = new Map(state.players.map((p) => [p.id, p.name]));

  return (
    <main className="min-h-[100dvh] px-4 py-6">
      <div className="mx-auto max-w-md space-y-4">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-sm underline underline-offset-4 text-foreground/80">
            Home
          </Link>
          <div className="heading text-xl">Round {round?.roundNumber}</div>
          <div />
        </header>
        <div className="card p-4">
          <h2 className="heading mb-3 text-lg">Speaking Order</h2>
          <ol className="space-y-2">
            {order.map((pid, idx) => (
              <li key={pid} className="rounded bg-muted-surface px-3 py-2">
                <span className="mr-2 text-muted-foreground">{idx + 1}.</span>
                {nameMap.get(pid)}
              </li>
            ))}
          </ol>
        </div>
        <button onClick={() => router.push("/vote")} className="tap-target w-full rounded-lg bg-accent px-4 py-3 font-medium text-black active:opacity-90">
          Proceed to Voting
        </button>
      </div>
    </main>
  );
}
