import Link from "next/link";

export default function RulesPage() {
  return (
    <main className="min-h-[100dvh] px-4 py-6">
      <div className="mx-auto max-w-md space-y-4">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-sm underline underline-offset-4 text-foreground/80">
            Home
          </Link>
          <h1 className="heading text-xl">How to Play</h1>
          <div />
        </header>
        <div className="card p-4 space-y-3 text-sm leading-6 text-foreground/90">
          <p>
            Subtext is a pass-and-play word deduction game for 3–20 players. Roles: Civilians (majority), Undercovers, and Mr. White.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Setup: choose the number of Undercovers and Mr. Whites.</li>
            <li>Words: Civilians share a secret word; Undercovers get a similar word; Mr. White gets no word.</li>
            <li>Describe: In random order, each player says one short clue about their word.</li>
            <li>Discuss & Vote: As a group, decide one player to eliminate.</li>
            <li>If Mr. White is eliminated, they can guess the Civilians’ word to win immediately.</li>
            <li>Victory: Civilians win when all infiltrators are gone. Infiltrators win if only one Civilian remains.</li>
            <li>Scoring: Civilians +2, Mr. White +6, Undercover +10 (winners only).</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
