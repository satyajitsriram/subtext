"use client";
import { useGame } from "@/lib/state";
import { useRouter } from "next/navigation";
import { checkVictory } from "@/lib/engine";

export default function EliminatedRevealPage() {
  const { state, dispatch } = useGame();
  const router = useRouter();
  const last = state.rounds[state.rounds.length - 1];
  const pid = last?.eliminatedPlayerId;
  const player = state.players.find((p) => p.id === pid);
  const role = state.assignedRoles?.find((r) => r.playerId === pid)?.role;

  if (!pid || !role) {
    router.replace("/round");
    return null;
  }

  return (
    <main className="min-h-[100dvh] px-4 py-6">
      <div className="mx-auto max-w-md space-y-6 text-center animate-pop">
        <h1 className="heading text-2xl">Eliminated</h1>
        <div className="card p-6 animate-pulse-fade">
          <div className="heading text-xl">{player?.name}</div>
          <div className="mt-2 text-sm text-muted-foreground">was</div>
          <div className="mt-2 text-2xl font-semibold">{role === "CIVILIAN" ? "Civilian" : role === "UNDERCOVER" ? "Undercover" : "Mr. White"}</div>
        </div>
        <button
          onClick={() => {
            const v = checkVictory(state);
            if (v) {
              dispatch({ type: "END_WITH_VICTORY", victory: v });
              router.push("/win");
            } else {
              dispatch({ type: "START_ROUND" });
              router.push("/round");
            }
          }}
          className="tap-target w-full rounded-lg bg-accent px-4 py-3 font-medium text-black"
        >
          Continue
        </button>
      </div>
    </main>
  );
}
