import React, { useRef, useEffect, useState } from 'react';
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

interface SoldierCanvasProps {
  options: BattleOption[];
  onUpdate: (
    aliveCounts: Map<TeamColor, number>,
    eliminatedTeams: Set<TeamColor>
  ) => void;
  onGameOver: (winner: BattleOption) => void;
  isPaused: boolean;
}

const soldierImageSources: Record<TeamColor, ReturnType<typeof require>> = {
  red: require('../../assets/soldier_red.png'),
  blue: require('../../assets/soldier_blue.png'),
  green: require('../../assets/soldier_green.png'),
  yellow: require('../../assets/soldier_yellow.png'),
};

const fortImageSources: Record<TeamColor, ReturnType<typeof require>> = {
  red: require('../../assets/fort_red.png'),
  blue: require('../../assets/fort_blue.png'),
  green: require('../../assets/fort_green.png'),
  yellow: require('../../assets/fort_yellow.png'),
};

const fortBrokenImageSources: Record<TeamColor, ReturnType<typeof require>> = {
  red: require('../../assets/fort_broken_red.png'),
  blue: require('../../assets/fort_broken_blue.png'),
  green: require('../../assets/fort_broken_green.png'),
  yellow: require('../../assets/fort_broken_yellow.png'),
};

export const SoldierCanvas: React.FC<SoldierCanvasProps> = ({
  options,
  onUpdate,
  onGameOver,
  isPaused,
}) => {
  // Soldier images
  const redImg = useImage(soldierImageSources.red);
  const blueImg = useImage(soldierImageSources.blue);
  const greenImg = useImage(soldierImageSources.green);
  const yellowImg = useImage(soldierImageSources.yellow);

  const teamImages: Record<TeamColor, ReturnType<typeof useImage>> = {
    red: redImg,
    blue: blueImg,
    green: greenImg,
    yellow: yellowImg,
  };

  // Fort images (normal)
  const fortRedImg = useImage(fortImageSources.red);
  const fortBlueImg = useImage(fortImageSources.blue);
  const fortGreenImg = useImage(fortImageSources.green);
  const fortYellowImg = useImage(fortImageSources.yellow);

  const teamFortImages: Record<TeamColor, ReturnType<typeof useImage>> = {
    red: fortRedImg,
    blue: fortBlueImg,
    green: fortGreenImg,
    yellow: fortYellowImg,
  };

  // Fort images (broken)
  const fortBrokenRedImg = useImage(fortBrokenImageSources.red);
  const fortBrokenBlueImg = useImage(fortBrokenImageSources.blue);
  const fortBrokenGreenImg = useImage(fortBrokenImageSources.green);
  const fortBrokenYellowImg = useImage(fortBrokenImageSources.yellow);

  const teamFortBrokenImages: Record<TeamColor, ReturnType<typeof useImage>> = {
    red: fortBrokenRedImg,
    blue: fortBrokenBlueImg,
    green: fortBrokenGreenImg,
    yellow: fortBrokenYellowImg,
  };

  const soldiersRef = useRef<Soldier[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const fortsRef = useRef<Fort[]>([]);
  const activeTeamsRef = useRef<TeamColor[]>([]);
  const eliminatedTeamsRef = useRef<Set<TeamColor>>(new Set());
  const gameOverRef = useRef(false);
  const frameCountRef = useRef(0);
  const spawnTimerRef = useRef(0);

  const isPausedRef = useRef(isPaused);
  const optionsRef = useRef(options);
  const onUpdateRef = useRef(onUpdate);
  const onGameOverRef = useRef(onGameOver);

  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { optionsRef.current = options; }, [options]);
  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);
  useEffect(() => { onGameOverRef.current = onGameOver; }, [onGameOver]);

  const [renderTrigger, setRenderTrigger] = useState(0);

  // Initialize forts and soldiers
  useEffect(() => {
    const teams: TeamColor[] = options.map((o) => o.color);
    const forts = createForts(teams, CANVAS_WIDTH, CANVAS_HEIGHT);
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
    spawnTimerRef.current = 0;

    const counts = countAliveByTeam(allSoldiers);
    onUpdate(counts, new Set());
  }, [options]);

  // Game loop
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

      for (const soldier of soldiers) {
        if (soldier.isDead) continue;

        const nearestEnemy = findNearestEnemy(soldier, soldiers);
        moveSoldier(soldier, nearestEnemy, forts, CANVAS_WIDTH, CANVAS_HEIGHT);
        tryShoot(soldier, nearestEnemy, forts, projectiles);
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

      // Spawn 1 soldier per alive fort every ~4 seconds (240 frames at 60fps)
      spawnTimerRef.current++;
      if (spawnTimerRef.current >= 300) {
        spawnTimerRef.current = 0;
        for (const fort of forts) {
          if (fort.isDestroyed) continue;
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

  const soldiers = soldiersRef.current;
  const projectiles = projectilesRef.current;
  const forts = fortsRef.current;

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <Fill color="#1a1a2e" />

        {/* Render forts (behind everything) */}
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
                  <Rect
                    x={barX}
                    y={barY}
                    width={HP_BAR_WIDTH}
                    height={HP_BAR_HEIGHT}
                    color="#333"
                  />
                  <Rect
                    x={barX}
                    y={barY}
                    width={HP_BAR_WIDTH * fillRatio}
                    height={HP_BAR_HEIGHT}
                    color={TEAM_COLORS[fort.teamId]}
                  />
                </>
              )}
            </Group>
          );
        })}

        {/* Render soldiers */}
        {soldiers.map((soldier) => {
          const img = teamImages[soldier.teamId];
          const opacity = soldier.isDead ? soldier.deathAnimation : 1;
          const size = soldier.isDead
            ? SPRITE_SIZE * soldier.deathAnimation
            : SPRITE_SIZE;
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
                <Circle
                  cx={soldier.x}
                  cy={soldier.y}
                  r={SOLDIER_RADIUS}
                  color={TEAM_COLORS[soldier.teamId]}
                />
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

        {/* Render projectiles */}
        {projectiles.map((projectile) => {
          if (!projectile.active) return null;
          return (
            <Circle
              key={projectile.id}
              cx={projectile.x}
              cy={projectile.y}
              r={PROJECTILE_RADIUS}
              color={TEAM_COLORS[projectile.teamId]}
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
              {
                left: fort.x - 25,
                top: topPos,
                color: TEAM_COLORS[fort.teamId],
              },
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
