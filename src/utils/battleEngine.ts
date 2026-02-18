import { Soldier, Projectile, Fort, TeamColor, TEAM_COLORS } from '../types';

const SOLDIER_SPEED = 1.0;
const RANDOM_MOVE_CHANCE = 0.55;
const RANDOM_MOVE_SPEED = 1.1;
const SHOOT_RANGE = 100;
const SHOOT_COOLDOWN = 60;
const PROJECTILE_SPEED = 5;
const PROJECTILE_RADIUS = 3;
const SOLDIER_RADIUS = 8;
const FORT_RADIUS = 28;
const FORT_MAX_HP = 10;

let idCounter = 0;
const generateId = () => `${Date.now()}-${idCounter++}`;

export function createForts(
  teams: TeamColor[],
  canvasWidth: number,
  canvasHeight: number
): Fort[] {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const radius = Math.min(canvasWidth, canvasHeight) * 0.35;

  return teams.map((teamId, i) => {
    const angle = -Math.PI / 2 + (i / teams.length) * Math.PI * 2;
    return {
      teamId,
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      hp: FORT_MAX_HP,
      maxHp: FORT_MAX_HP,
      isDestroyed: false,
    };
  });
}

export function createSoldiers(
  teamId: TeamColor,
  count: number,
  fortX: number,
  fortY: number,
  canvasWidth: number,
  canvasHeight: number
): Soldier[] {
  const soldiers: Soldier[] = [];
  const spreadRadius = 40;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const distance = Math.random() * spreadRadius;

    soldiers.push({
      id: generateId(),
      teamId,
      x: Math.max(SOLDIER_RADIUS, Math.min(canvasWidth - SOLDIER_RADIUS, fortX + Math.cos(angle) * distance)),
      y: Math.max(SOLDIER_RADIUS, Math.min(canvasHeight - SOLDIER_RADIUS, fortY + Math.sin(angle) * distance)),
      hp: 3,
      maxHp: 3,
      shootCooldown: Math.floor(Math.random() * SHOOT_COOLDOWN),
      targetId: null,
      isDead: false,
      deathAnimation: 0,
    });
  }

  return soldiers;
}

export function findNearestEnemy(
  soldier: Soldier,
  allSoldiers: Soldier[]
): Soldier | null {
  let nearest: Soldier | null = null;
  let minDist = Infinity;

  for (const other of allSoldiers) {
    if (other.teamId === soldier.teamId || other.isDead) continue;

    const dx = other.x - soldier.x;
    const dy = other.y - soldier.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < minDist) {
      minDist = dist;
      nearest = other;
    }
  }

  return nearest;
}

export function findNearestEnemyFort(
  soldier: Soldier,
  forts: Fort[]
): Fort | null {
  let nearest: Fort | null = null;
  let minDist = Infinity;

  for (const fort of forts) {
    if (fort.teamId === soldier.teamId || fort.isDestroyed) continue;

    const dx = fort.x - soldier.x;
    const dy = fort.y - soldier.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < minDist) {
      minDist = dist;
      nearest = fort;
    }
  }

  return nearest;
}

export function moveSoldier(
  soldier: Soldier,
  target: Soldier | null,
  forts: Fort[],
  canvasWidth: number,
  canvasHeight: number
): void {
  if (soldier.isDead) return;

  if (Math.random() < RANDOM_MOVE_CHANCE) {
    const angle = Math.random() * Math.PI * 2;
    soldier.x += Math.cos(angle) * RANDOM_MOVE_SPEED;
    soldier.y += Math.sin(angle) * RANDOM_MOVE_SPEED;
  } else if (target) {
    const dx = target.x - soldier.x;
    const dy = target.y - soldier.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > SHOOT_RANGE * 0.5) {
      soldier.x += (dx / dist) * SOLDIER_SPEED;
      soldier.y += (dy / dist) * SOLDIER_SPEED;
    }

    soldier.targetId = target.id;
  } else {
    const fort = findNearestEnemyFort(soldier, forts);
    if (fort) {
      const dx = fort.x - soldier.x;
      const dy = fort.y - soldier.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > SHOOT_RANGE * 0.5) {
        soldier.x += (dx / dist) * SOLDIER_SPEED;
        soldier.y += (dy / dist) * SOLDIER_SPEED;
      }
    }
  }

  soldier.x = Math.max(SOLDIER_RADIUS, Math.min(canvasWidth - SOLDIER_RADIUS, soldier.x));
  soldier.y = Math.max(SOLDIER_RADIUS, Math.min(canvasHeight - SOLDIER_RADIUS, soldier.y));
}

export function tryShoot(
  soldier: Soldier,
  target: Soldier | null,
  forts: Fort[],
  projectiles: Projectile[]
): void {
  if (soldier.isDead) return;

  if (soldier.shootCooldown > 0) {
    soldier.shootCooldown--;
    return;
  }

  if (target) {
    const dx = target.x - soldier.x;
    const dy = target.y - soldier.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= SHOOT_RANGE) {
      const vx = (dx / dist) * PROJECTILE_SPEED;
      const vy = (dy / dist) * PROJECTILE_SPEED;

      projectiles.push({
        id: generateId(),
        shooterId: soldier.id,
        teamId: soldier.teamId,
        x: soldier.x,
        y: soldier.y,
        targetX: target.x,
        targetY: target.y,
        vx,
        vy,
        active: true,
      });

      soldier.shootCooldown = SHOOT_COOLDOWN;
      return;
    }
  }

  const fort = findNearestEnemyFort(soldier, forts);
  if (fort) {
    const dx = fort.x - soldier.x;
    const dy = fort.y - soldier.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= SHOOT_RANGE) {
      const vx = (dx / dist) * PROJECTILE_SPEED;
      const vy = (dy / dist) * PROJECTILE_SPEED;

      projectiles.push({
        id: generateId(),
        shooterId: soldier.id,
        teamId: soldier.teamId,
        x: soldier.x,
        y: soldier.y,
        targetX: fort.x,
        targetY: fort.y,
        vx,
        vy,
        active: true,
      });

      soldier.shootCooldown = SHOOT_COOLDOWN;
    }
  }
}

export function updateProjectiles(
  projectiles: Projectile[],
  soldiers: Soldier[],
  forts: Fort[],
  canvasWidth: number,
  canvasHeight: number
): void {
  for (const projectile of projectiles) {
    if (!projectile.active) continue;

    projectile.x += projectile.vx;
    projectile.y += projectile.vy;

    if (
      projectile.x < 0 ||
      projectile.x > canvasWidth ||
      projectile.y < 0 ||
      projectile.y > canvasHeight
    ) {
      projectile.active = false;
      continue;
    }

    let hit = false;
    for (const soldier of soldiers) {
      if (soldier.teamId === projectile.teamId || soldier.isDead) continue;

      const dx = soldier.x - projectile.x;
      const dy = soldier.y - projectile.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < SOLDIER_RADIUS + PROJECTILE_RADIUS) {
        soldier.hp--;
        projectile.active = false;

        if (soldier.hp <= 0) {
          soldier.isDead = true;
          soldier.deathAnimation = 1;
        }
        hit = true;
        break;
      }
    }

    if (hit) continue;

    for (const fort of forts) {
      if (fort.teamId === projectile.teamId || fort.isDestroyed) continue;

      const dx = fort.x - projectile.x;
      const dy = fort.y - projectile.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < FORT_RADIUS + PROJECTILE_RADIUS) {
        fort.hp--;
        projectile.active = false;

        if (fort.hp <= 0) {
          fort.hp = 0;
          fort.isDestroyed = true;
        }
        break;
      }
    }
  }
}

export function updateDeathAnimations(soldiers: Soldier[]): void {
  for (const soldier of soldiers) {
    if (soldier.isDead && soldier.deathAnimation > 0) {
      soldier.deathAnimation -= 0.05;
      if (soldier.deathAnimation < 0) {
        soldier.deathAnimation = 0;
      }
    }
  }
}

export function cleanupProjectiles(projectiles: Projectile[]): Projectile[] {
  return projectiles.filter((p) => p.active);
}

export function cleanupSoldiers(soldiers: Soldier[]): Soldier[] {
  return soldiers.filter((s) => !s.isDead || s.deathAnimation > 0);
}

export function countAliveByTeam(soldiers: Soldier[]): Map<TeamColor, number> {
  const counts = new Map<TeamColor, number>();

  for (const soldier of soldiers) {
    if (!soldier.isDead) {
      counts.set(soldier.teamId, (counts.get(soldier.teamId) || 0) + 1);
    }
  }

  return counts;
}

export function spawnSoldierAtFort(
  fort: Fort,
  canvasWidth: number,
  canvasHeight: number
): Soldier | null {
  if (fort.isDestroyed) return null;

  const angle = Math.random() * Math.PI * 2;
  const distance = 15 + Math.random() * 25;

  const x = Math.max(SOLDIER_RADIUS, Math.min(canvasWidth - SOLDIER_RADIUS, fort.x + Math.cos(angle) * distance));
  const y = Math.max(SOLDIER_RADIUS, Math.min(canvasHeight - SOLDIER_RADIUS, fort.y + Math.sin(angle) * distance));

  return {
    id: generateId(),
    teamId: fort.teamId,
    x,
    y,
    hp: 3,
    maxHp: 3,
    shootCooldown: Math.floor(Math.random() * SHOOT_COOLDOWN),
    targetId: null,
    isDead: false,
    deathAnimation: 0,
  };
}

export function checkWinner(forts: Fort[], soldiers: Soldier[]): TeamColor | null {
  const aliveForts = forts.filter((f) => !f.isDestroyed);

  if (aliveForts.length === 1) {
    return aliveForts[0].teamId;
  }

  if (aliveForts.length === 0) {
    const aliveCounts = countAliveByTeam(soldiers);
    const teamsAlive = [...aliveCounts.entries()].filter(([, count]) => count > 0);
    if (teamsAlive.length === 1) {
      return teamsAlive[0][0];
    }
  }

  return null;
}

export { SOLDIER_RADIUS, PROJECTILE_RADIUS, FORT_RADIUS, FORT_MAX_HP, TEAM_COLORS };
