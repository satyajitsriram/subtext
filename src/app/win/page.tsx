"use client";
import { useGame } from "@/lib/state";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WinPage() {
  const { state, dispatch } = useGame();
  const router = useRouter();

  useEffect(() => {
    if (state.status !== "finished") {
      router.replace("/");
    }
  }, [state.status, router]);

  const winners = state.winners?.playerIds ?? [];
  const nameMap = new Map(state.players.map((p) => [p.id, p.name]));
  const group = state.winners?.group;

  return (
    <main className="min-h-[100dvh] px-4 py-6">
      <div className="mx-auto max-w-md space-y-4 text-center">
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
