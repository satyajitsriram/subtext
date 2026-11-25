"use client";
import { useGame } from "@/lib/state";
import Link from "next/link";
import { useState } from "react";

export default function WordsPage() {
  const { persistCustomPair } = useGame();
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [category, setCategory] = useState("custom");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");

  const add = () => {
    if (!a.trim() || !b.trim()) return;
    persistCustomPair(a.trim(), b.trim(), category.trim() || "custom", difficulty);
    setA("");
    setB("");
    alert("Saved! Custom pairs are included automatically in new games.");
  };

  return (
    <main className="min-h-[100dvh] px-4 py-6">
      <div className="mx-auto max-w-md space-y-4">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-sm underline underline-offset-4 text-foreground/80">
            Home
          </Link>
          <h1 className="heading text-xl">Custom Word Pairs</h1>
          <div />
        </header>
        <div className="card p-4 space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <input className="rounded-md bg-background border border-white/10 p-3" placeholder="Word A (e.g., pancake)" value={a} onChange={(e) => setA(e.target.value)} />
            <input className="rounded-md bg-background border border-white/10 p-3" placeholder="Word B (e.g., crepe)" value={b} onChange={(e) => setB(e.target.value)} />
            <input className="rounded-md bg-background border border-white/10 p-3" placeholder="Category (optional)" value={category} onChange={(e) => setCategory(e.target.value)} />
            <select className="rounded-md bg-background border border-white/10 p-3" value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <button onClick={add} className="tap-target w-full rounded-lg bg-accent px-4 py-3 font-medium text-black">
            Add Pair
          </button>
        </div>
      </div>
    </main>
  );
}
