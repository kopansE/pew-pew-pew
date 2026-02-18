import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { TEAM_COLORS, TeamColor, BattleOption } from "../types";

type RootStackParamList = {
  Setup: { previousOptions?: BattleOption[] } | undefined;
  Battle: { options: BattleOption[] };
};

type SetupScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Setup">;
  route: RouteProp<RootStackParamList, "Setup">;
};

const TEAM_ORDER: TeamColor[] = ["red", "blue", "green", "yellow"];

export const SetupScreen: React.FC<SetupScreenProps> = ({
  navigation,
  route,
}) => {
  const prev = route.params?.previousOptions;

  const [optionCount, setOptionCount] = useState(() =>
    prev ? prev.length : 2,
  );
  const [optionNames, setOptionNames] = useState<string[]>(() => {
    if (prev) {
      const names = ["", "", "", ""];
      prev.forEach((opt, i) => {
        names[i] = opt.name;
      });
      return names;
    }
    return ["", "", "", ""];
  });

  const handleOptionCountChange = (count: number) => {
    setOptionCount(count);
  };

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...optionNames];
    newNames[index] = name;
    setOptionNames(newNames);
  };

  const isPlayEnabled = () => {
    for (let i = 0; i < optionCount; i++) {
      if (!optionNames[i].trim()) return false;
    }
    return true;
  };

  const handlePlay = () => {
    const options: BattleOption[] = [];
    for (let i = 0; i < optionCount; i++) {
      options.push({
        name: optionNames[i].trim(),
        color: TEAM_ORDER[i],
        colorHex: TEAM_COLORS[TEAM_ORDER[i]],
      });
    }
    navigation.navigate("Battle", { options });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>PewDecide</Text>
        <Text style={styles.subtitle}>Let the battle decide for you</Text>

        {/* Option Count Selector */}
        <View style={styles.stepperContainer}>
          <Text style={styles.label}>Number of options</Text>
          <View style={styles.stepper}>
            {[2, 3, 4].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.stepperButton,
                  optionCount === num && styles.stepperButtonActive,
                ]}
                onPress={() => handleOptionCountChange(num)}
              >
                <Text
                  style={[
                    styles.stepperText,
                    optionCount === num && styles.stepperTextActive,
                  ]}
                >
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Option Inputs */}
        <View style={styles.inputsContainer}>
          {Array.from({ length: optionCount }).map((_, index) => (
            <View key={index} style={styles.inputRow}>
              <View
                style={[
                  styles.colorSwatch,
                  { backgroundColor: TEAM_COLORS[TEAM_ORDER[index]] },
                ]}
              />
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Option {index + 1}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={`Enter option ${index + 1}...`}
                  placeholderTextColor="#666"
                  value={optionNames[index]}
                  onChangeText={(text) => handleNameChange(index, text)}
                  maxLength={20}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Play Button */}
        <TouchableOpacity
          style={[
            styles.playButton,
            !isPlayEnabled() && styles.playButtonDisabled,
          ]}
          onPress={handlePlay}
          disabled={!isPlayEnabled()}
        >
          <Text style={styles.playButtonText}>Play</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1a",
  },
  scrollContent: {
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 40,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    marginBottom: 48,
  },
  stepperContainer: {
    width: "100%",
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    color: "#888",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  stepper: {
    flexDirection: "row",
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    padding: 4,
  },
  stepperButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 10,
  },
  stepperButtonActive: {
    backgroundColor: "#4361ee",
  },
  stepperText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
  },
  stepperTextActive: {
    color: "#fff",
  },
  inputsContainer: {
    width: "100%",
    gap: 16,
    marginBottom: 40,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#1a1a2e",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#2a2a3e",
  },
  playButton: {
    width: "100%",
    backgroundColor: "#4361ee",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
  },
  playButtonDisabled: {
    backgroundColor: "#2a2a3e",
  },
  playButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
});
