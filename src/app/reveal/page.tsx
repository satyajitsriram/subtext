"use client";
import { useGame } from "@/lib/state";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function vibrateBrief() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      // 15ms tick
      navigator.vibrate?.(15);
    } catch {}
  }
}

export default function RevealPage() {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const roles = new Map(state.assignedRoles?.map((r) => [r.playerId, r.role]) ?? []);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  const beep = () => {
    if (!state.settings.soundsEnabled || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = 680;
    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.06, audioCtx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.14);
  };

  useEffect(() => {
    if (!state.assignedRoles) router.replace("/setup");
  }, [state.assignedRoles, router]);

  useEffect(() => {
    if (state.settings.soundsEnabled && typeof window !== "undefined") {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioCtx(ctx);
      return () => {
        ctx.close().catch(() => {});
      };
    }
    return;
  }, [state.settings.soundsEnabled]);

  if (!state.assignedRoles) return null;

  const showWord = (playerId: string) => {
    setRevealed((r) => ({ ...r, [playerId]: !r[playerId] }));
    vibrateBrief();
    beep();
  };

  const canContinue = state.players.every((p) => revealed[p.id]);

  return (
    <main className="min-h-[100dvh] px-4 py-6">
      <div className="mx-auto max-w-md space-y-4">
        <header className="text-center">
          <h1 className="heading text-xl">Pass & Reveal</h1>
          <p className="text-xs text-muted-foreground">Tap your card to reveal privately. Tap again to hide.</p>
        </header>
        <div className="grid grid-cols-2 gap-3">
          {state.players.map((p) => {
            const role = roles.get(p.id);
            const secret =
              role === "MR_WHITE"
                ? "You are Mr. White"
                : role === "CIVILIAN"
                ? state.civilianWord
                : state.undercoverWord;
            const isOpen = !!revealed[p.id];
            return (
              <button
                key={p.id}
                onClick={() => showWord(p.id)}
                className="flip card tap-target relative h-40 w-full overflow-hidden"
              >
                <div className={`flip-inner h-full w-full ${isOpen ? "rotate-y-180" : ""}`} style={{ transform: isOpen ? "rotateY(180deg)" : "none" }}>
                  <div className="flip-front absolute inset-0 flex items-center justify-center p-3">
                    <div className="text-center">
                      <div className="heading text-lg">{p.name}</div>
                      <div className="text-xs text-muted-foreground">Tap to reveal</div>
                    </div>
                  </div>
                  <div className="flip-back absolute inset-0 flex items-center justify-center p-3">
                    <div className="text-center">
                      <div className="heading text-lg">{p.name}</div>
                      <div className="mt-1 rounded bg-background/60 px-2 py-1 text-sm">
                        {secret}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <button
          disabled={!canContinue}
          onClick={() => {
            dispatch({ type: "FINISH_REVEAL" });
            dispatch({ type: "START_ROUND" });
            router.push("/round");
          }}
          className="tap-target w-full rounded-lg bg-accent px-4 py-3 font-medium text-black disabled:opacity-40"
        >
          Start Round
        </button>
      </div>
    </main>
  );
}
