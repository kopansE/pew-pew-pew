import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BattleOption, TeamColor } from '../types';

interface HUDProps {
  options: BattleOption[];
  aliveCounts: Map<TeamColor, number>;
  eliminatedTeams: Set<TeamColor>;
  wins: Record<string, number>;
}

/** Returns black or white depending on which has more contrast against the bg. */
function contrastText(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#0f0f1a' : '#ffffff';
}

export const HUD: React.FC<HUDProps> = ({
  options,
  aliveCounts,
  eliminatedTeams,
  wins,
}) => {
  const seen = new Set<TeamColor>();
  const dedupedOptions = options.filter((opt) => {
    if (seen.has(opt.color)) return false;
    seen.add(opt.color);
    return true;
  });

  const cellWidth: '50%' | '33.33%' =
    dedupedOptions.length === 3 ? '33.33%' : '50%';

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {dedupedOptions.map((option) => {
          const isEliminated = eliminatedTeams.has(option.color);
          const count = aliveCounts.get(option.color) || 0;
          const winCount = wins[option.color] || 0;
          const headerBg = isEliminated ? '#1c1c2a' : option.colorHex;
          const headerText = isEliminated ? '#3a3a5a' : contrastText(option.colorHex);

          return (
            <View
              key={option.color}
              style={[styles.cell, { width: cellWidth }]}
            >
              {/* Colored header band with name */}
              <View style={[styles.header, { backgroundColor: headerBg }]}>
                <Text
                  style={[styles.headerName, { color: headerText }]}
                  numberOfLines={1}
                >
                  {isEliminated ? `✕ ${option.name}` : option.name}
                </Text>
              </View>

              {/* Stats row */}
              <View style={styles.statsRow}>
                <View style={styles.statBlock}>
                  <Text
                    style={[
                      styles.winsNumber,
                      { color: isEliminated ? '#2e2e42' : '#ffffff' },
                    ]}
                  >
                    {winCount}
                  </Text>
                  <Text style={styles.statLabel}>WINS</Text>
                </View>

                <View style={styles.vertDivider} />

                <View style={styles.statBlock}>
                  <Text
                    style={[
                      styles.armyNumber,
                      { color: isEliminated ? '#2e2e42' : '#777' },
                    ]}
                  >
                    {count}
                  </Text>
                  <Text style={styles.statLabel}>ARMY</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0d0d1a',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1e1e30',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#1e1e30',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1e1e30',
    overflow: 'hidden',
  },
  header: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  headerName: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  vertDivider: {
    width: StyleSheet.hairlineWidth,
    height: 30,
    backgroundColor: '#2a2a40',
    marginHorizontal: 4,
  },
  winsNumber: {
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 32,
  },
  armyNumber: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 32,
  },
  statLabel: {
    fontSize: 9,
    color: '#444',
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: 1,
  },
});
