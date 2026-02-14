export type StarState = "locked" | "available" | "opened";

export interface StarData {
  id: string;
  label?: string;
  position: [number, number, number];
  message: string;
  state?: StarState;
}

export interface BackgroundStar {
  id: string;
  position: [number, number, number];
  state: StarState;
}

export interface StarsConfig {
  constellationName: string;
  mainStarIds: string[];
  edges: [string, string][];
  stars: StarData[];
  backgroundStars: BackgroundStar[];
  finalMessage: { title: string; body: string };
  easterEgg?: { title: string; body: string };
}

export type Phase = "exploring" | "letter-open" | "formation" | "complete";
