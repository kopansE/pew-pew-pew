import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BattleOption, TeamColor, TEAM_COLORS, TEAM_EMOJIS } from '../types';

interface HUDProps {
  options: BattleOption[];
  aliveCounts: Map<TeamColor, number>;
  eliminatedTeams: Set<TeamColor>;
}

export const HUD: React.FC<HUDProps> = ({
  options,
  aliveCounts,
  eliminatedTeams,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.teamsContainer}>
        {options.map((option, index) => {
          const isEliminated = eliminatedTeams.has(option.color);
          const count = aliveCounts.get(option.color) || 0;

          return (
            <View key={option.color} style={styles.teamItem}>
              <Text style={styles.emoji}>{TEAM_EMOJIS[option.color]}</Text>
              <Text
                style={[
                  styles.teamName,
                  isEliminated && styles.eliminated,
                  { color: isEliminated ? '#666' : option.colorHex },
                ]}
              >
                {option.name}
              </Text>
              <Text
                style={[
                  styles.count,
                  isEliminated && styles.eliminatedCount,
                ]}
              >
                — {count}
              </Text>
              {index < options.length - 1 && (
                <Text style={styles.separator}>|</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#0f0f1a',
  },
  teamsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emoji: {
    fontSize: 12,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
  },
  count: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  eliminated: {
    textDecorationLine: 'line-through',
  },
  eliminatedCount: {
    color: '#666',
  },
  separator: {
    color: '#444',
    marginHorizontal: 8,
    fontSize: 14,
  },
});
