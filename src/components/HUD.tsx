import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BattleOption, TeamColor, TEAM_COLORS } from '../types';

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
              <View
                style={[
                  styles.teamDot,
                  {
                    backgroundColor: isEliminated ? '#444' : option.colorHex,
                  },
                ]}
              />
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
  teamDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
