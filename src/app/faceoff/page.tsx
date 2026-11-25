"use client";
import { useGame } from "@/lib/state";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export default function FaceoffPage() {
  const { state } = useGame();
  const router = useRouter();
  const round = state.rounds[state.rounds.length - 1];
  const ids = round?.faceOffIds || [];
  const players = useMemo(() => state.players.filter((p) => ids.includes(p.id)), [state.players, ids]);

  if (ids.length < 2) {
    router.replace("/vote");
    return null;
  }

  return (
    <main className="min-h-[100dvh] px-4 py-6">
      <div className="mx-auto max-w-md space-y-4">
        <header className="text-center">
          <h1 className="heading text-xl">Tie Face-off</h1>
          <p className="text-xs text-muted-foreground">Only tied players give one more short clue. Then revote among them.</p>
        </header>
        <div className="card p-4">
          <ul className="space-y-2">
            {players.map((p) => (
              <li key={p.id} className="rounded bg-muted-surface px-3 py-2">{p.name}</li>
            ))}
          </ul>
        </div>
        <button onClick={() => router.push("/revote")} className="tap-target w-full rounded-lg bg-accent px-4 py-3 font-medium text-black">
          Revote Among These Players
        </button>
      </div>
    </main>
  );
}
