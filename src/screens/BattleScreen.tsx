import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { BattleOption, TeamColor } from '../types';
import { SoldierCanvas } from '../components/SoldierCanvas';
import { HUD } from '../components/HUD';

type RootStackParamList = {
  Home: undefined;
  Setup: { previousOptions?: BattleOption[]; previousFortHp?: number } | undefined;
  Battle: { options: BattleOption[]; fortHp: number };
};

type BattleScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Battle'>;
  route: RouteProp<RootStackParamList, 'Battle'>;
};

export const BattleScreen: React.FC<BattleScreenProps> = ({
  navigation,
  route,
}) => {
  const { options, fortHp } = route.params;

  const [aliveCounts, setAliveCounts] = useState<Map<TeamColor, number>>(
    new Map()
  );
  const [eliminatedTeams, setEliminatedTeams] = useState<Set<TeamColor>>(
    new Set()
  );
  const [winner, setWinner] = useState<BattleOption | null>(null);
  const [gameKey, setGameKey] = useState(0);

  const handleUpdate = useCallback(
    (counts: Map<TeamColor, number>, eliminated: Set<TeamColor>) => {
      setAliveCounts(new Map(counts));
      setEliminatedTeams(new Set(eliminated));
    },
    []
  );

  const handleGameOver = useCallback((winningOption: BattleOption) => {
    setWinner(winningOption);
  }, []);

  const handleRematch = () => {
    setWinner(null);
    // Reset the stack to [Home, Setup] so back-swipe always goes Home → Setup → Battle
    // and never accumulates previous game screens
    navigation.reset({
      index: 1,
      routes: [
        { name: 'Home' },
        { name: 'Setup', params: { previousOptions: options, previousFortHp: fortHp } },
      ],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <HUD
        options={options}
        aliveCounts={aliveCounts}
        eliminatedTeams={eliminatedTeams}
      />

      <SoldierCanvas
        key={gameKey}
        options={options}
        fortHp={fortHp}
        onUpdate={handleUpdate}
        onGameOver={handleGameOver}
        isPaused={winner !== null}
      />

      {/* Victory Modal */}
      <Modal visible={winner !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.victoryEmoji}>🎉</Text>
            <Text style={styles.victoryLabel}>Winner</Text>
            <Text
              style={[
                styles.victoryText,
                { color: winner?.colorHex || '#fff' },
              ]}
            >
              {winner?.name}
            </Text>

            <TouchableOpacity
              style={styles.rematchButton}
              onPress={handleRematch}
            >
              <Text style={styles.modalButtonText}>Rematch</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '80%',
    maxWidth: 320,
  },
  victoryEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  victoryLabel: {
    fontSize: 16,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  victoryText: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
  },
  rematchButton: {
    width: '100%',
    backgroundColor: '#4361ee',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
