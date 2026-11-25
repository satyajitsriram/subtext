import { randomUUID } from "crypto";
import { AssignedRole, GameSettings, GameState, Player, Role, TieBreaker, WordPair } from "./types";

// Utility: random shuffle (Fisher-Yates)
export function shuffleArray<T>(arr: T[], rnd: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function suggestRoles(playerCount: number): { numUndercovers: number; numMrWhites: number } {
  // Heuristic based on common guidance and official app's auto-suggest behavior:
  // - Keep at least 1 infiltrator, and roughly 20–30% infiltrators for medium sizes.
  // - Prefer 1 Mr. White for 5+, allow 0 or 1 below that.
  if (playerCount <= 3) return { numUndercovers: 1, numMrWhites: 0 };
  if (playerCount <= 5) return { numUndercovers: 1, numMrWhites: 1 };
  if (playerCount <= 7) return { numUndercovers: 2, numMrWhites: 1 };
  if (playerCount <= 10) return { numUndercovers: 2, numMrWhites: 1 };
  if (playerCount <= 14) return { numUndercovers: 3, numMrWhites: 1 };
  if (playerCount <= 17) return { numUndercovers: 4, numMrWhites: 1 };
  // up to 20
  return { numUndercovers: 4, numMrWhites: 2 };
}

export function validateSetup(players: Player[], numUndercovers: number, numMrWhites: number): void {
  const n = players.length;
  if (n < 3 || n > 20) {
    throw new Error("Player count must be between 3 and 20.");
  }
  if (numUndercovers < 0 || numMrWhites < 0) {
    throw new Error("Invalid negative role counts.");
  }
  const infiltrators = numUndercovers + numMrWhites;
  if (infiltrators < 1) {
    throw new Error("At least one infiltrator (Undercover or Mr. White) is required.");
  }
  if (infiltrators >= n) {
    throw new Error("There must be at least one Civilian.");
  }
  // Civilians do not strictly need to outnumber infiltrators in official text;
  // we allow it but the suggestor aims at fair ratios.
}

export function assignRoles(players: Player[], numUndercovers: number, numMrWhites: number, rnd: () => number = Math.random): AssignedRole[] {
  validateSetup(players, numUndercovers, numMrWhites);
  const n = players.length;
  const indices = shuffleArray(players.map((_, i) => i), rnd);
  const roles: Role[] = [];
  for (let i = 0; i < numUndercovers; i++) roles.push("UNDERCOVER");
  for (let i = 0; i < numMrWhites; i++) roles.push("MR_WHITE");
  while (roles.length < n) roles.push("CIVILIAN");
  const shuffledRoles = shuffleArray(roles, rnd);
  return indices.map((pi, i) => ({
    playerId: players[pi].id,
    role: shuffledRoles[i],
  }));
}

export function pickWordPair(
  allPairs: WordPair[],
  usedIndices: number[],
  settings: { includeSpicy: boolean; categories: string[]; difficulties: Array<"easy" | "medium" | "hard"> },
  rnd: () => number = Math.random
): { index: number; civilianWord: string; undercoverWord: string } {
  const filtered = allPairs
    .map((pair, index) => ({ pair, index }))
    .filter(({ pair, index }) => {
      if (usedIndices.includes(index)) return false;
      if (!settings.includeSpicy && pair.spicy) return false;
      if (settings.categories.length > 0 && !settings.categories.includes(pair.category)) return false;
      if (!settings.difficulties.includes(pair.difficulty)) return false;
      return true;
    });
  if (filtered.length === 0) {
    throw new Error("No more word pairs available with current filters.");
  }
  const pick = filtered[Math.floor(rnd() * filtered.length)];
  // Randomly assign A/B sides to Civilians vs Undercover
  const swap = rnd() < 0.5;
  const civilianWord = swap ? pick.pair.a : pick.pair.b;
  const undercoverWord = swap ? pick.pair.b : pick.pair.a;
  return { index: pick.index, civilianWord, undercoverWord };
}

export function startNewGame(
  players: Player[],
  settings: GameSettings,
  words: WordPair[],
  prevUsed: number[] = [],
  rnd: () => number = Math.random
): GameState {
  validateSetup(players, settings.numUndercovers, settings.numMrWhites);
  const assigned = assignRoles(players, settings.numUndercovers, settings.numMrWhites, rnd);
  const { index, civilianWord, undercoverWord } = pickWordPair(words, prevUsed, settings, rnd);
  const alive = players.map((p) => p.id);
  const mrWhiteAlive = assigned.some((r) => r.role === "MR_WHITE");
  // Special assignments
  const ids = shuffleArray(alive, rnd);
  const bag = ids.slice();
  const takeOne = () => bag.shift();
  const takePair = () => {
    const a = bag.shift();
    const b = bag.shift();
    if (a && b) return [a, b] as [string, string];
    return undefined;
  };
  const specials: any = {};
  if (settings.specials.goddessOfJustice) {
    const g = takeOne();
    if (g) specials.goddessId = g;
  }
  if (settings.specials.lovers && players.length >= 5) {
    const lp = takePair();
    if (lp) specials.loversPair = lp;
  }
  if (settings.specials.duelists && players.length >= 5) {
    const dp = takePair();
    if (dp) specials.duelistsPair = dp;
  }
  if (settings.specials.revenger && players.length >= 5) {
    const r = takeOne();
    if (r) specials.revengerId = r;
  }
  if (settings.specials.falafelVendor && players.length >= 4) {
    const v = takeOne();
    if (v) specials.falafelVendorId = v;
  }
  if (settings.specials.boomerang) {
    const b = takeOne();
    if (b) specials.boomerangId = b;
  }
  if (settings.specials.joyFool) {
    const j = takeOne();
    if (j) specials.joyFoolId = j;
  }
  return {
    players,
    alivePlayerIds: alive,
    assignedRoles: assigned,
    civilianWord,
    undercoverWord,
    mrWhiteAlive,
    usedWordIndices: [...prevUsed, index],
    currentWordIndex: index,
    settings,
    specials,
    rounds: [],
    status: "revealing",
  };
}

export function buildSpeakingOrder(aliveIds: string[], rnd: () => number = Math.random): string[] {
  // Official rules: random player starts each round. No exception for Mr. White.
  return shuffleArray(aliveIds, rnd);
}

export function beginRound(state: GameState, rnd: () => number = Math.random): GameState {
  if (state.status !== "in_round" && state.status !== "revealing" && state.status !== "voting" && state.status !== "idle") {
    // allow proceed from revealing to first round
  }
  const roundNumber = state.rounds.length + 1;
  const speakingOrder = buildSpeakingOrder(state.alivePlayerIds, rnd);
  const mrMemeId =
    state.settings.specials.mrMeme && state.alivePlayerIds.length > 0
      ? shuffleArray(state.alivePlayerIds, rnd)[0]
      : undefined;
  return {
    ...state,
    rounds: [
      ...state.rounds,
      {
        roundNumber,
        speakingOrder,
        mrMemeId,
      },
    ],
    status: "in_round",
  };
}

export function castVotes(
  state: GameState,
  votes: Record<string, string>
): { topIds: string[]; counts: Record<string, number> } {
  // Living players' votes count; if Ghost special enabled, eliminated can also vote
  const allowGhost = !!state.settings.specials.ghost;
  const aliveSet = new Set(state.alivePlayerIds);
  const counts: Record<string, number> = {};
  for (const [voter, target] of Object.entries(votes)) {
    const voterIsAlive = aliveSet.has(voter);
    if ((!voterIsAlive && !allowGhost) || !aliveSet.has(target)) continue;
    counts[target] = (counts[target] || 0) + 1;
  }
  // Falafel sabotage baseline +1 on target
  const lastRound = state.rounds[state.rounds.length - 1];
  if (lastRound?.falafelEffect === "SABOTAGE" && lastRound.falafelGivenToId && aliveSet.has(lastRound.falafelGivenToId)) {
    counts[lastRound.falafelGivenToId] = (counts[lastRound.falafelGivenToId] || 0) + 1;
  }
  const max = Math.max(0, ...Object.values(counts));
  let topIds = Object.entries(counts)
    .filter(([, c]) => c === max)
    .map(([id]) => id);
  // Falafel protection: ignore protected target from elimination
  if (lastRound?.falafelEffect === "PROTECT" && lastRound.falafelGivenToId) {
    if (topIds.includes(lastRound.falafelGivenToId)) {
      // remove protected and recompute next highest excluding protected
      const filtered = { ...counts };
      delete filtered[lastRound.falafelGivenToId];
      const nmax = Math.max(0, ...Object.values(filtered));
      topIds = Object.entries(filtered)
        .filter(([, c]) => c === nmax)
        .map(([id]) => id);
    }
  }
  return { topIds, counts };
}

export function resolveTie(
  state: GameState,
  topIds: string[],
  tieBreaker: TieBreaker,
  rnd: () => number = Math.random
): string | null {
  if (topIds.length <= 1) return topIds[0] ?? null;
  switch (tieBreaker) {
    case "random":
      return topIds[Math.floor(rnd() * topIds.length)];
    case "manual":
      // facilitator chooses outside the app; return null to indicate pending manual resolution
      return null;
    case "revote":
    default:
      // In-app we handle by marking a face-off; UI will collect revote among these ids only.
      return null;
  }
}

export function eliminatePlayer(state: GameState, playerId: string): GameState {
  const alive = state.alivePlayerIds.filter((id) => id !== playerId);
  const eliminatedRole = state.assignedRoles?.find((r) => r.playerId === playerId)?.role;
  const mrWhiteAlive = eliminatedRole === "MR_WHITE" ? false : state.mrWhiteAlive;
  const lastRoundIndex = state.rounds.length - 1;
  const rounds = state.rounds.slice();
  if (lastRoundIndex >= 0) {
    rounds[lastRoundIndex] = { ...rounds[lastRoundIndex], eliminatedPlayerId: playerId };
  }
  let next: GameState = {
    ...state,
    alivePlayerIds: alive,
    mrWhiteAlive,
    rounds,
  };
  // Special: Lovers — if one dies, the other is eliminated too (reveal lovers at that time)
  const lovers = state.specials?.loversPair;
  if (state.settings.specials.lovers && lovers && lovers.includes(playerId)) {
    const partner = lovers[0] === playerId ? lovers[1] : lovers[0];
    if (next.alivePlayerIds.includes(partner)) {
      next = eliminatePlayer(next, partner);
    }
  }
  // Special: Duelists — first eliminated loses 2, the other gains 2
  const duel = state.specials?.duelistsPair;
  if (state.settings.specials.duelists && duel && duel.includes(playerId)) {
    const other = duel[0] === playerId ? duel[1] : duel[0];
    next = {
      ...next,
      players: next.players.map((p) =>
        p.id === playerId ? { ...p, score: p.score - 2 } : p.id === other ? { ...p, score: p.score + 2 } : p
      ),
    };
  }
  // Special: Joy Fool — if first eliminated overall is joyFool, +4 points
  if (state.settings.specials.joyFool && !state.rounds.some((r) => r.eliminatedPlayerId) && state.specials?.joyFoolId === playerId) {
    next = { ...next, players: next.players.map((p) => (p.id === playerId ? { ...p, score: p.score + 4 } : p)) };
  }
  return next;
}

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/\s+/g, " ")
    .trim();
}

export function isLooseMatch(target: string, guess: string): boolean {
  const t = normalizeText(target);
  const g = normalizeText(guess);
  if (t === g) return true;
  // Simple plural/singular forgiveness
  const sing = (s: string) => (s.endsWith("es") ? s.slice(0, -2) : s.endsWith("s") ? s.slice(0, -1) : s);
  if (sing(t) === sing(g)) return true;
  // small typos: allow Levenshtein distance 1 for short words, 2 for longer
  const dist = levenshtein(t, g);
  if (t.length <= 5) return dist <= 1;
  return dist <= 2;
}

export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return dp[m][n];
}

export function checkVictory(state: GameState): { group: "CIVILIANS" | "INFILTRATORS" | "MR_WHITE"; playerIds: string[] } | null {
  const aliveIds = new Set(state.alivePlayerIds);
  const roles = new Map(state.assignedRoles?.map((r) => [r.playerId, r.role]) ?? []);
  const aliveCivilians = [...aliveIds].filter((id) => roles.get(id) === "CIVILIAN");
  const aliveUndercovers = [...aliveIds].filter((id) => roles.get(id) === "UNDERCOVER");
  const aliveMrWhites = [...aliveIds].filter((id) => roles.get(id) === "MR_WHITE");

  if (aliveUndercovers.length === 0 && aliveMrWhites.length === 0) {
    return { group: "CIVILIANS", playerIds: [...aliveIds] };
  }
  if (aliveCivilians.length === 1) {
    // Infiltrators (Undercover and/or Mr. White) win together
    const infiltrators = [...aliveIds].filter((id) => roles.get(id) !== "CIVILIAN");
    return { group: "INFILTRATORS", playerIds: infiltrators };
  }
  return null;
}

export function mrWhiteGuessVictory(state: GameState, guess: string): boolean {
  if (!state.civilianWord) return false;
  return isLooseMatch(state.civilianWord, guess);
}

export function applyVictoryScoring(state: GameState, victory: { group: "CIVILIANS" | "INFILTRATORS" | "MR_WHITE"; playerIds: string[] }): GameState {
  const roles = new Map(state.assignedRoles?.map((r) => [r.playerId, r.role]) ?? []);
  const updatedPlayers = state.players.map((p) => {
    if (!victory.playerIds.includes(p.id)) return p;
    const role = roles.get(p.id);
    let delta = 0;
    if (victory.group === "CIVILIANS") {
      delta = 2;
    } else if (victory.group === "INFILTRATORS") {
      delta = role === "UNDERCOVER" ? 10 : role === "MR_WHITE" ? 6 : 0;
    } else if (victory.group === "MR_WHITE") {
      delta = role === "MR_WHITE" ? 6 : 0;
    }
    return { ...p, score: p.score + delta };
  });
  return { ...state, players: updatedPlayers, winners: victory, status: "finished" };
}

export function initPlayersFromNames(names: string[]): Player[] {
  return names.map((name) => ({ id: randomUUID(), name: name.trim(), score: 0 }));
}
