import React, { useState, useCallback, useRef } from 'react';
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

  const [aliveCounts, setAliveCounts] = useState<Map<TeamColor, number>>(new Map());
  const [eliminatedTeams, setEliminatedTeams] = useState<Set<TeamColor>>(new Set());
  const [winner, setWinner] = useState<BattleOption | null>(null);
  const [gameKey, setGameKey] = useState(0);

  // Win tracking — persists across rounds in a series
  const [wins, setWins] = useState<Record<string, number>>({});
  const winsRef = useRef<Record<string, number>>({});
  const [showRootingFor, setShowRootingFor] = useState(false);

  const handleUpdate = useCallback(
    (counts: Map<TeamColor, number>, eliminated: Set<TeamColor>) => {
      setAliveCounts(new Map(counts));
      setEliminatedTeams(new Set(eliminated));
    },
    []
  );

  const handleGameOver = useCallback((winningOption: BattleOption) => {
    const newWins = { ...winsRef.current };
    newWins[winningOption.color] = (newWins[winningOption.color] || 0) + 1;
    winsRef.current = newWins;

    const maxWins = Math.max(...Object.values(newWins));
    setWins(newWins);
    setWinner(winningOption);
    if (maxWins >= 4) {
      setShowRootingFor(true);
    }
  }, []);

  // X for "Best out of X": 3 if leader has 1 win, 5 if 2, 7 if 3
  const maxWins =
    Object.keys(wins).length > 0 ? Math.max(...Object.values(wins)) : 0;
  const bestOfX = maxWins >= 3 ? 7 : maxWins >= 2 ? 5 : 3;

  const handleBestOf = () => {
    setWinner(null);
    setGameKey((k) => k + 1);
  };

  const handleAcceptWinner = () => {
    navigation.popToTop();
  };

  const handleDebateSomethingElse = () => {
    navigation.popToTop();
  };

  return (
    <SafeAreaView style={styles.container}>
      <HUD
        options={options}
        aliveCounts={aliveCounts}
        eliminatedTeams={eliminatedTeams}
        wins={wins}
      />

      <SoldierCanvas
        key={gameKey}
        options={options}
        fortHp={fortHp}
        onUpdate={handleUpdate}
        onGameOver={handleGameOver}
        isPaused={winner !== null || showRootingFor}
      />

      {/* Victory Modal */}
      <Modal
        visible={winner !== null && !showRootingFor}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.victoryEmoji}>🎉</Text>
            <Text style={styles.victoryLabel}>Winner</Text>
            <Text
              style={[styles.victoryText, { color: winner?.colorHex || '#fff' }]}
            >
              {winner?.name}
            </Text>

            <TouchableOpacity style={styles.primaryButton} onPress={handleBestOf}>
              <Text style={styles.primaryButtonText}>Best out of {bestOfX}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleAcceptWinner}
            >
              <Text style={styles.secondaryButtonText}>Accept Winner</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 4-Win "Rooting For" Modal */}
      <Modal visible={showRootingFor} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.rootingTitle}>
              The option you're rooting for
            </Text>
            <Text style={styles.rootingSubtitle}>— pick that one</Text>

            <TouchableOpacity
              style={[styles.primaryButton, { marginTop: 32 }]}
              onPress={handleDebateSomethingElse}
            >
              <Text style={styles.primaryButtonText}>Debate something else</Text>
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
  primaryButton: {
    width: '100%',
    backgroundColor: '#4361ee',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#3a3a5e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  rootingTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 34,
  },
  rootingSubtitle: {
    fontSize: 20,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
  },
});
