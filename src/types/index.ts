export type TeamColor = 'red' | 'blue' | 'green' | 'yellow';

export interface Team {
  id: TeamColor;
  name: string;
  color: string;
  soldiers: Soldier[];
}

export interface Soldier {
  id: string;
  teamId: TeamColor;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  shootCooldown: number;
  targetId: string | null;
  isDead: boolean;
  deathAnimation: number; // 0-1, used for death fade
}

export interface Projectile {
  id: string;
  shooterId: string;
  teamId: TeamColor;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  active: boolean;
}

export interface Fort {
  teamId: TeamColor;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  isDestroyed: boolean;
}

export interface BattleOption {
  name: string;
  color: TeamColor;
  colorHex: string;
}

export interface GameState {
  soldiers: Soldier[];
  projectiles: Projectile[];
  teams: Map<TeamColor, { name: string; alive: number }>;
  winner: TeamColor | null;
  gameOver: boolean;
}

export const TEAM_COLORS: Record<TeamColor, string> = {
  red: '#e63946',
  blue: '#4361ee',
  green: '#2a9d8f',
  yellow: '#f4a261',
};

export const TEAM_EMOJIS: Record<TeamColor, string> = {
  red: '🔴',
  blue: '🔵',
  green: '🟢',
  yellow: '🟡',
};
