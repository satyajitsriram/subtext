export type Role = "CIVILIAN" | "UNDERCOVER" | "MR_WHITE";

export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface AssignedRole {
  playerId: string;
  role: Role;
  word?: string; // undefined for Mr. White
}

export interface WordPair {
  a: string;
  b: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  spicy?: boolean;
}

export type TieBreaker =
  | "revote" // tied players give one more clue, then re-vote among them
  | "random" // Goddess of Justice
  | "manual"; // facilitator decides (e.g., rock-paper-scissors)

export interface GameSettings {
  numUndercovers: number;
  numMrWhites: number;
  revealOnElimination: boolean; // official app reveals; toggleable
  allowRecheckWord: boolean;
  tieBreaker: TieBreaker;
  includeSpicy: boolean; // off by default
  categories: string[]; // empty = all
  difficulties: Array<"easy" | "medium" | "hard">; // defaults to all
}

export interface RoundState {
  roundNumber: number;
  speakingOrder: string[]; // playerIds, randomized each round
  votes?: Record<string, string>; // voterId -> targetId
  faceOffIds?: string[]; // when tie occurs
  eliminatedPlayerId?: string;
}

export interface GameState {
  players: Player[];
  alivePlayerIds: string[];
  assignedRoles?: AssignedRole[]; // present after setup
  civilianWord?: string;
  undercoverWord?: string;
  mrWhiteAlive?: boolean;
  usedWordIndices: number[]; // indices into master word list for no-repeat
  currentWordIndex?: number; // index of pair in play
  settings: GameSettings;
  rounds: RoundState[];
  status:
    | "idle" // before setup
    | "revealing" // pass-and-play reveal words
    | "in_round" // describing + discussion
    | "voting" // voting/faceoff
    | "finished";
  winners?: {
    group: "CIVILIANS" | "INFILTRATORS" | "MR_WHITE";
    playerIds: string[];
  };
}
