import React, { useRef, useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  Rect,
  Fill,
  Image as SkiaImage,
  useImage,
} from '@shopify/react-native-skia';
import {
  Soldier,
  Projectile,
  Fort,
  TeamColor,
  BattleOption,
  TEAM_COLORS,
} from '../types';
import {
  createForts,
  createSoldiers,
  findNearestEnemy,
  moveSoldier,
  tryShoot,
  updateProjectiles,
  updateDeathAnimations,
  cleanupProjectiles,
  cleanupSoldiers,
  countAliveByTeam,
  checkWinner,
  spawnSoldierAtFort,
  SOLDIER_RADIUS,
  PROJECTILE_RADIUS,
  FORT_RADIUS,
} from '../utils/battleEngine';

const SPRITE_SIZE = 28;
const FORT_RENDER_SIZE = 64;
const HP_BAR_WIDTH = 50;
const HP_BAR_HEIGHT = 5;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CANVAS_WIDTH = SCREEN_WIDTH;
const CANVAS_HEIGHT = SCREEN_HEIGHT * 0.65;
const SOLDIERS_PER_TEAM = 20;

// Spawn interval decays from 300 frames (~5s) down to 40 frames (~0.67s)
function getBaseSpawnInterval(elapsedFrames: number): number {
  const elapsedSeconds = elapsedFrames / 60;
  return Math.max(40, Math.round(300 * Math.exp(-elapsedSeconds / 40)));
}

interface SoldierCanvasProps {
  options: BattleOption[];
  fortHp: number;
  onUpdate: (
    aliveCounts: Map<TeamColor, number>,
    eliminatedTeams: Set<TeamColor>
  ) => void;
  onGameOver: (winner: BattleOption) => void;
  isPaused: boolean;
}

export const SoldierCanvas: React.FC<SoldierCanvasProps> = ({
  options,
  fortHp,
  onUpdate,
  onGameOver,
  isPaused,
}) => {
  // ── Soldier images (13 colors) ──────────────────────────────────────────────
  const imgSoldierRed       = useImage(require('../../assets/soldier_red.png'));
  const imgSoldierBlue      = useImage(require('../../assets/soldier_blue.png'));
  const imgSoldierGreen     = useImage(require('../../assets/soldier_green.png'));
  const imgSoldierYellow    = useImage(require('../../assets/soldier_yellow.png'));
  const imgSoldierCoral     = useImage(require('../../assets/soldier_coral.png'));
  const imgSoldierCyan      = useImage(require('../../assets/soldier_cyan.png'));
  const imgSoldierLime      = useImage(require('../../assets/soldier_lime.png'));
  const imgSoldierMagenta   = useImage(require('../../assets/soldier_magenta.png'));
  const imgSoldierOrange    = useImage(require('../../assets/soldier_orange.png'));
  const imgSoldierPeach     = useImage(require('../../assets/soldier_peach.png'));
  const imgSoldierPurple    = useImage(require('../../assets/soldier_purple.png'));
  const imgSoldierTeal      = useImage(require('../../assets/soldier_teal.png'));
  const imgSoldierTurquoise = useImage(require('../../assets/soldier_turquoise.png'));

  const teamImages: Record<TeamColor, ReturnType<typeof useImage>> = {
    red:       imgSoldierRed,
    blue:      imgSoldierBlue,
    green:     imgSoldierGreen,
    yellow:    imgSoldierYellow,
    coral:     imgSoldierCoral,
    cyan:      imgSoldierCyan,
    lime:      imgSoldierLime,
    magenta:   imgSoldierMagenta,
    orange:    imgSoldierOrange,
    peach:     imgSoldierPeach,
    purple:    imgSoldierPurple,
    teal:      imgSoldierTeal,
    turquoise: imgSoldierTurquoise,
  };

  // ── Fort images – normal (13 colors) ────────────────────────────────────────
  const imgFortRed       = useImage(require('../../assets/fort_red.png'));
  const imgFortBlue      = useImage(require('../../assets/fort_blue.png'));
  const imgFortGreen     = useImage(require('../../assets/fort_green.png'));
  const imgFortYellow    = useImage(require('../../assets/fort_yellow.png'));
  const imgFortCoral     = useImage(require('../../assets/fort_coral.png'));
  const imgFortCyan      = useImage(require('../../assets/fort_cyan.png'));
  const imgFortLime      = useImage(require('../../assets/fort_lime.png'));
  const imgFortMagenta   = useImage(require('../../assets/fort_magenta.png'));
  const imgFortOrange    = useImage(require('../../assets/fort_orange.png'));
  const imgFortPeach     = useImage(require('../../assets/fort_peach.png'));
  const imgFortPurple    = useImage(require('../../assets/fort_purple.png'));
  const imgFortTeal      = useImage(require('../../assets/fort_teal.png'));
  const imgFortTurquoise = useImage(require('../../assets/fort_turquoise.png'));

  const teamFortImages: Record<TeamColor, ReturnType<typeof useImage>> = {
    red:       imgFortRed,
    blue:      imgFortBlue,
    green:     imgFortGreen,
    yellow:    imgFortYellow,
    coral:     imgFortCoral,
    cyan:      imgFortCyan,
    lime:      imgFortLime,
    magenta:   imgFortMagenta,
    orange:    imgFortOrange,
    peach:     imgFortPeach,
    purple:    imgFortPurple,
    teal:      imgFortTeal,
    turquoise: imgFortTurquoise,
  };

  // ── Fort images – broken (13 colors) ────────────────────────────────────────
  const imgFortBrokenRed       = useImage(require('../../assets/fort_broken_red.png'));
  const imgFortBrokenBlue      = useImage(require('../../assets/fort_broken_blue.png'));
  const imgFortBrokenGreen     = useImage(require('../../assets/fort_broken_green.png'));
  const imgFortBrokenYellow    = useImage(require('../../assets/fort_broken_yellow.png'));
  const imgFortBrokenCoral     = useImage(require('../../assets/fort_broken_coral.png'));
  const imgFortBrokenCyan      = useImage(require('../../assets/fort_broken_cyan.png'));
  const imgFortBrokenLime      = useImage(require('../../assets/fort_broken_lime.png'));
  const imgFortBrokenMagenta   = useImage(require('../../assets/fort_broken_magenta.png'));
  const imgFortBrokenOrange    = useImage(require('../../assets/fort_broken_orange.png'));
  const imgFortBrokenPeach     = useImage(require('../../assets/fort_broken_peach.png'));
  const imgFortBrokenPurple    = useImage(require('../../assets/fort_broken_purple.png'));
  const imgFortBrokenTeal      = useImage(require('../../assets/fort_broken_teal.png'));
  const imgFortBrokenTurquoise = useImage(require('../../assets/fort_broken_turquoise.png'));

  const teamFortBrokenImages: Record<TeamColor, ReturnType<typeof useImage>> = {
    red:       imgFortBrokenRed,
    blue:      imgFortBrokenBlue,
    green:     imgFortBrokenGreen,
    yellow:    imgFortBrokenYellow,
    coral:     imgFortBrokenCoral,
    cyan:      imgFortBrokenCyan,
    lime:      imgFortBrokenLime,
    magenta:   imgFortBrokenMagenta,
    orange:    imgFortBrokenOrange,
    peach:     imgFortBrokenPeach,
    purple:    imgFortBrokenPurple,
    teal:      imgFortBrokenTeal,
    turquoise: imgFortBrokenTurquoise,
  };

  // ── Game state refs ──────────────────────────────────────────────────────────
  const soldiersRef = useRef<Soldier[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const fortsRef = useRef<Fort[]>([]);
  const activeTeamsRef = useRef<TeamColor[]>([]);
  const eliminatedTeamsRef = useRef<Set<TeamColor>>(new Set());
  const gameOverRef = useRef(false);
  const frameCountRef = useRef(0);

  // Per-fort spawn timers and targets
  const fortSpawnTimersRef = useRef<number[]>([]);
  const fortSpawnTargetsRef = useRef<number[]>([]);
  const gameElapsedFramesRef = useRef(0);

  const isPausedRef = useRef(isPaused);
  const optionsRef = useRef(options);
  const onUpdateRef = useRef(onUpdate);
  const onGameOverRef = useRef(onGameOver);

  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { optionsRef.current = options; }, [options]);
  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);
  useEffect(() => { onGameOverRef.current = onGameOver; }, [onGameOver]);

  const [renderTrigger, setRenderTrigger] = useState(0);

  // ── Initialize ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const teams: TeamColor[] = options.map((o) => o.color);
    const forts = createForts(teams, CANVAS_WIDTH, CANVAS_HEIGHT, fortHp);
    fortsRef.current = forts;

    const allSoldiers: Soldier[] = [];
    for (const fort of forts) {
      const teamSoldiers = createSoldiers(
        fort.teamId,
        SOLDIERS_PER_TEAM,
        fort.x,
        fort.y,
        CANVAS_WIDTH,
        CANVAS_HEIGHT
      );
      allSoldiers.push(...teamSoldiers);
    }

    soldiersRef.current = allSoldiers;
    projectilesRef.current = [];
    activeTeamsRef.current = teams;
    eliminatedTeamsRef.current = new Set();
    gameOverRef.current = false;
    frameCountRef.current = 0;
    gameElapsedFramesRef.current = 0;

    // Stagger initial timers so forts don't all spawn at the same moment
    fortSpawnTimersRef.current = forts.map((_, i) =>
      Math.floor(Math.random() * 150 + i * (300 / forts.length))
    );
    fortSpawnTargetsRef.current = forts.map(() => 300);

    const counts = countAliveByTeam(allSoldiers);
    onUpdate(counts, new Set());
  }, [options]);

  // ── Game loop ────────────────────────────────────────────────────────────────
  useEffect(() => {
    let rafId: number;

    const gameLoop = () => {
      if (isPausedRef.current || gameOverRef.current) {
        rafId = requestAnimationFrame(gameLoop);
        return;
      }

      const soldiers = soldiersRef.current;
      const projectiles = projectilesRef.current;
      const forts = fortsRef.current;

      // Movement: 1× → 4× cap, reaches 2× at ~45s
      const speedMultiplier = Math.min(4.0, 1.0 + gameElapsedFramesRef.current / 2700);
      // Attack rate: 1× → 3× cap, reaches 2× at ~60s
      const attackSpeedMultiplier = Math.min(3.0, 1.0 + gameElapsedFramesRef.current / 3600);

      for (const soldier of soldiers) {
        if (soldier.isDead) continue;
        const nearestEnemy = findNearestEnemy(soldier, soldiers);
        moveSoldier(soldier, nearestEnemy, forts, CANVAS_WIDTH, CANVAS_HEIGHT, speedMultiplier);
        tryShoot(soldier, nearestEnemy, forts, projectiles, attackSpeedMultiplier);
      }

      updateProjectiles(projectiles, soldiers, forts, CANVAS_WIDTH, CANVAS_HEIGHT);
      updateDeathAnimations(soldiers);

      projectilesRef.current = cleanupProjectiles(projectiles);
      soldiersRef.current = cleanupSoldiers(soldiers);

      const aliveCounts = countAliveByTeam(soldiersRef.current);

      for (const fort of forts) {
        if (fort.isDestroyed && !eliminatedTeamsRef.current.has(fort.teamId)) {
          eliminatedTeamsRef.current.add(fort.teamId);
        }
      }

      // Per-fort spawn with exponential rate boost and jitter to break sync
      gameElapsedFramesRef.current++;
      for (let i = 0; i < forts.length; i++) {
        const fort = forts[i];
        if (fort.isDestroyed) continue;

        fortSpawnTimersRef.current[i]++;

        if (fortSpawnTimersRef.current[i] >= fortSpawnTargetsRef.current[i]) {
          fortSpawnTimersRef.current[i] = 0;

          const base = getBaseSpawnInterval(gameElapsedFramesRef.current);
          const jitter = Math.floor((Math.random() - 0.5) * 60);
          fortSpawnTargetsRef.current[i] = Math.max(45, base + jitter);

          const newSoldier = spawnSoldierAtFort(fort, CANVAS_WIDTH, CANVAS_HEIGHT);
          if (newSoldier) {
            soldiersRef.current.push(newSoldier);
          }
        }
      }

      const winner = checkWinner(forts, soldiersRef.current);
      if (winner) {
        gameOverRef.current = true;
        const winningOption = optionsRef.current.find((o) => o.color === winner);
        if (winningOption) {
          onGameOverRef.current(winningOption);
        }
      }

      frameCountRef.current++;
      if (frameCountRef.current % 2 === 0) {
        onUpdateRef.current(aliveCounts, new Set(eliminatedTeamsRef.current));
        setRenderTrigger((prev) => prev + 1);
      }

      rafId = requestAnimationFrame(gameLoop);
    };

    rafId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Color map: teamId → colorHex from the options passed in
  const colorMap = useMemo(() => {
    const map: Partial<Record<TeamColor, string>> = {};
    for (const opt of options) {
      map[opt.color] = opt.colorHex;
    }
    return map;
  }, [options]);

  const getColor = (teamId: TeamColor) => colorMap[teamId] ?? TEAM_COLORS[teamId];

  const soldiers = soldiersRef.current;
  const projectiles = projectilesRef.current;
  const forts = fortsRef.current;

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <Fill color="#1a1a2e" />

        {/* Forts */}
        {forts.map((fort) => {
          const img = fort.isDestroyed
            ? teamFortBrokenImages[fort.teamId]
            : teamFortImages[fort.teamId];
          const half = FORT_RENDER_SIZE / 2;
          const barX = fort.x - HP_BAR_WIDTH / 2;
          const barY = fort.y + half + 4;
          const fillRatio = fort.hp / fort.maxHp;

          return (
            <Group key={`fort-${fort.teamId}`}>
              {img && (
                <SkiaImage
                  image={img}
                  x={fort.x - half}
                  y={fort.y - half}
                  width={FORT_RENDER_SIZE}
                  height={FORT_RENDER_SIZE}
                  fit="contain"
                />
              )}
              {!fort.isDestroyed && (
                <>
                  <Rect x={barX} y={barY} width={HP_BAR_WIDTH} height={HP_BAR_HEIGHT} color="#333" />
                  <Rect x={barX} y={barY} width={HP_BAR_WIDTH * fillRatio} height={HP_BAR_HEIGHT} color={getColor(fort.teamId)} />
                </>
              )}
            </Group>
          );
        })}

        {/* Soldiers */}
        {soldiers.map((soldier) => {
          const img = teamImages[soldier.teamId];
          const opacity = soldier.isDead ? soldier.deathAnimation : 1;
          const size = soldier.isDead ? SPRITE_SIZE * soldier.deathAnimation : SPRITE_SIZE;
          const half = size / 2;

          return (
            <Group key={soldier.id} opacity={opacity}>
              {img ? (
                <SkiaImage
                  image={img}
                  x={soldier.x - half}
                  y={soldier.y - half}
                  width={size}
                  height={size}
                  fit="contain"
                />
              ) : (
                <Circle cx={soldier.x} cy={soldier.y} r={SOLDIER_RADIUS} color={getColor(soldier.teamId)} />
              )}
              {!soldier.isDead && soldier.hp < soldier.maxHp && (
                <Circle
                  cx={soldier.x}
                  cy={soldier.y - half - 3}
                  r={2}
                  color={soldier.hp === 2 ? '#ffcc00' : '#ff4444'}
                />
              )}
            </Group>
          );
        })}

        {/* Projectiles */}
        {projectiles.map((projectile) => {
          if (!projectile.active) return null;
          return (
            <Circle
              key={projectile.id}
              cx={projectile.x}
              cy={projectile.y}
              r={PROJECTILE_RADIUS}
              color={getColor(projectile.teamId)}
            />
          );
        })}
      </Canvas>

      {/* Fort HP text overlays */}
      {forts.map((fort) => {
        if (fort.isDestroyed) return null;
        const topPos = fort.y + FORT_RENDER_SIZE / 2 + HP_BAR_HEIGHT + 6;
        return (
          <Text
            key={`hp-text-${fort.teamId}`}
            style={[
              styles.fortHpText,
              { left: fort.x - 25, top: topPos, color: getColor(fort.teamId) },
            ]}
          >
            {fort.hp}/{fort.maxHp}
          </Text>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  canvas: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  },
  fortHpText: {
    position: 'absolute',
    width: 50,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
