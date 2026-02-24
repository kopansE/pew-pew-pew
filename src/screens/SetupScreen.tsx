import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Keyboard,
  InputAccessoryView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { TEAM_COLORS, TeamColor, BattleOption } from "../types";

type RootStackParamList = {
  Setup: { previousOptions?: BattleOption[]; previousFortHp?: number } | undefined;
  Battle: { options: BattleOption[]; fortHp: number };
};

type SetupScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Setup">;
  route: RouteProp<RootStackParamList, "Setup">;
};

// Default color assignment per slot
const TEAM_ORDER: TeamColor[] = ["red", "blue", "teal", "yellow"];

// All available colors in picker order
const ALL_COLORS: TeamColor[] = [
  "red", "coral", "orange", "peach",
  "yellow", "lime", "green", "teal",
  "turquoise", "cyan", "blue", "purple",
  "magenta",
];

const INPUT_ACCESSORY_ID = "done-keyboard";

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
      prev.forEach((opt, i) => { names[i] = opt.name; });
      return names;
    }
    return ["", "", "", ""];
  });
  const [optionColors, setOptionColors] = useState<TeamColor[]>(() => {
    if (prev) {
      const colors: TeamColor[] = [...TEAM_ORDER];
      prev.forEach((opt, i) => { colors[i] = opt.color; });
      return colors;
    }
    return [...TEAM_ORDER];
  });
  const [activeColorPicker, setActiveColorPicker] = useState<number | null>(null);
  const [fortHp, setFortHp] = useState(() => route.params?.previousFortHp ?? 10);

  const handleOptionCountChange = (count: number) => {
    setOptionCount(count);
    setActiveColorPicker(null);
  };

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...optionNames];
    newNames[index] = name;
    setOptionNames(newNames);
  };

  const toggleColorPicker = (index: number) => {
    Keyboard.dismiss();
    setActiveColorPicker((prev) => (prev === index ? null : index));
  };

  const selectColor = (index: number, color: TeamColor) => {
    const newColors = [...optionColors];
    newColors[index] = color;
    setOptionColors(newColors);
    setActiveColorPicker(null);
  };

  const isPlayEnabled = () => {
    for (let i = 0; i < optionCount; i++) {
      if (!optionNames[i].trim()) return false;
    }
    return true;
  };

  const handlePlay = () => {
    Keyboard.dismiss();
    setActiveColorPicker(null);
    const options: BattleOption[] = [];
    for (let i = 0; i < optionCount; i++) {
      const teamColor = optionColors[i];
      options.push({
        name: optionNames[i].trim(),
        color: teamColor,
        colorHex: TEAM_COLORS[teamColor],
      });
    }
    navigation.navigate("Battle", { options, fortHp });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
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
            {Array.from({ length: optionCount }).map((_, index) => {
              const currentColor = optionColors[index];
              const currentHex = TEAM_COLORS[currentColor];
              return (
                <View key={index} style={styles.inputItem}>
                  <View style={styles.inputRow}>
                    <TouchableOpacity onPress={() => toggleColorPicker(index)}>
                      <View
                        style={[
                          styles.colorSwatch,
                          { backgroundColor: currentHex },
                          activeColorPicker === index && styles.colorSwatchActive,
                        ]}
                      />
                    </TouchableOpacity>
                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>Option {index + 1}</Text>
                      <TextInput
                        style={styles.input}
                        placeholder={`Enter option ${index + 1}...`}
                        placeholderTextColor="#666"
                        value={optionNames[index]}
                        onChangeText={(text) => handleNameChange(index, text)}
                        maxLength={20}
                        returnKeyType="done"
                        onSubmitEditing={Keyboard.dismiss}
                        inputAccessoryViewID={INPUT_ACCESSORY_ID}
                      />
                    </View>
                  </View>

                  {activeColorPicker === index && (
                    <View style={styles.colorPickerRow}>
                      {ALL_COLORS.map((color) => (
                        <TouchableOpacity
                          key={color}
                          onPress={() => selectColor(index, color)}
                          style={styles.paletteColorWrapper}
                        >
                          <View
                            style={[
                              styles.paletteColor,
                              { backgroundColor: TEAM_COLORS[color] },
                              currentColor === color && styles.paletteColorSelected,
                            ]}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Battle Length Selector */}
          <View style={styles.stepperContainer}>
            <Text style={styles.label}>Battle length</Text>
            <View style={styles.stepper}>
              {([
                { label: 'Quick', hp: 5 },
                { label: 'Avg', hp: 10 },
                { label: 'Long', hp: 20 },
              ] as const).map(({ label, hp }) => (
                <TouchableOpacity
                  key={hp}
                  style={[
                    styles.stepperButton,
                    fortHp === hp && styles.stepperButtonActive,
                  ]}
                  onPress={() => setFortHp(hp)}
                >
                  <Text
                    style={[
                      styles.stepperText,
                      fortHp === hp && styles.stepperTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                  <Text
                    style={[
                      styles.stepperSubText,
                      fortHp === hp && styles.stepperSubTextActive,
                    ]}
                  >
                    {hp} hp
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
      </KeyboardAvoidingView>

      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID={INPUT_ACCESSORY_ID}>
          <View style={styles.doneBar}>
            <TouchableOpacity
              onPress={Keyboard.dismiss}
              style={styles.doneButton}
            >
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}
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
  stepperSubText: {
    fontSize: 11,
    color: "#555",
    marginTop: 2,
  },
  stepperSubTextActive: {
    color: "rgba(255,255,255,0.7)",
  },
  inputsContainer: {
    width: "100%",
    marginBottom: 40,
  },
  inputItem: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  colorSwatchActive: {
    borderColor: "#fff",
    borderWidth: 2.5,
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
  colorPickerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    marginLeft: 40,
    gap: 8,
  },
  paletteColorWrapper: {
    padding: 2,
  },
  paletteColor: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "transparent",
  },
  paletteColorSelected: {
    borderColor: "#fff",
    transform: [{ scale: 1.15 }],
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
  doneBar: {
    backgroundColor: "#1a1a2e",
    borderTopWidth: 1,
    borderTopColor: "#2a2a3e",
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "flex-end",
  },
  doneButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  doneText: {
    color: "#4361ee",
    fontSize: 16,
    fontWeight: "600",
  },
});
