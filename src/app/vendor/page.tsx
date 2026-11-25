"use client";
import { useGame } from "@/lib/state";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function VendorPage() {
  const { state, dispatch } = useGame();
  const router = useRouter();
  const vendorId = state.specials?.falafelVendorId;
  const vendor = state.players.find((p) => p.id === vendorId);
  const candidates = useMemo(
    () => state.players.filter((p) => state.alivePlayerIds.includes(p.id) && p.id !== vendorId),
    [state.players, state.alivePlayerIds, vendorId]
  );
  const [targetId, setTargetId] = useState<string>("");

  const shouldRedirect = !state.settings.specials.falafelVendor || !vendorId || !state.alivePlayerIds.includes(vendorId);
  useEffect(() => {
    if (shouldRedirect) router.replace("/round");
  }, [shouldRedirect, router]);
  if (shouldRedirect) return null;

  function confirm() {
    if (!targetId) return;
    const effect: "PROTECT" | "SABOTAGE" = Math.random() < 0.5 ? "PROTECT" : "SABOTAGE";
    dispatch({ type: "SET_FALAFEL", targetId, effect });
    router.replace("/round");
  }

  return (
    <main className="min-h-[100dvh] px-4 py-6">
      <div className="mx-auto max-w-md space-y-4">
        <header className="text-center">
          <h1 className="heading text-xl">Falafel Vendor</h1>
          <p className="text-xs text-muted-foreground">Pass the phone to {vendor?.name}. Pick one player for a falafel this round.</p>
        </header>
        <div className="grid grid-cols-2 gap-3">
          {candidates.map((p) => {
            const active = targetId === p.id;
            return (
              <button key={p.id} onClick={() => setTargetId(p.id)} className={`rounded-lg border p-4 text-center ${active ? "border-info bg-info/20" : "border-white/10 bg-muted-surface"}`}>
                <div className="heading">{p.name}</div>
              </button>
            );
          })}
        </div>
        <button disabled={!targetId} onClick={confirm} className="tap-target w-full rounded-lg bg-accent px-4 py-3 font-medium text-black disabled:opacity-40">
          Confirm (kept secret)
        </button>
        <p className="text-center text-xs text-muted-foreground">The falafel is random: protection or sabotage, for this round only.</p>
      </div>
    </main>
  );
}
