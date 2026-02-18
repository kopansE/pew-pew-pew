import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const { width } = Dimensions.get("window");

type RootStackParamList = {
  Home: undefined;
  Setup: undefined;
};

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const fadeHero = useRef(new Animated.Value(0)).current;
  const fadeTagline = useRef(new Animated.Value(0)).current;
  const fadeDesc = useRef(new Animated.Value(0)).current;
  const fadeButton = useRef(new Animated.Value(0)).current;
  const slideHero = useRef(new Animated.Value(30)).current;
  const slideTagline = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.parallel([
        Animated.timing(fadeHero, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideHero, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeTagline, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideTagline, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(fadeDesc, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeButton, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.heroSection}>
          <Animated.Text
            style={[
              styles.swordsEmoji,
              { opacity: fadeHero, transform: [{ translateY: slideHero }] },
            ]}
          >
            ⚔️
          </Animated.Text>

          <Animated.Text
            style={[
              styles.heroLine1,
              { opacity: fadeHero, transform: [{ translateY: slideHero }] },
            ]}
          >
            Can't choose?
          </Animated.Text>

          <Animated.Text
            style={[
              styles.heroLine2,
              {
                opacity: fadeTagline,
                transform: [{ translateY: slideTagline }],
              },
            ]}
          >
            Let fate decide.
          </Animated.Text>
        </View>

        <Animated.View style={[styles.descSection, { opacity: fadeDesc }]}>
          <Text style={styles.descText}>
            Enter your options. Watch armies clash.{"\n"}
            The last fort standing wins.
          </Text>

          <View style={styles.featureRow}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🏰</Text>
              <Text style={styles.featureLabel}>Forts</Text>
            </View>
            <View style={styles.featureDivider} />
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>💥</Text>
              <Text style={styles.featureLabel}>Battles</Text>
            </View>
            <View style={styles.featureDivider} />
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎯</Text>
              <Text style={styles.featureLabel}>Decisions</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.buttonWrapper,
            { opacity: fadeButton, transform: [{ scale: pulseAnim }] },
          ]}
        >
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate("Setup")}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>Begin</Text>
            <Text style={styles.ctaArrow}>→</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.Text style={[styles.footerText, { opacity: fadeDesc }]}>
          2 – 4 options • random battles • zero regrets
        </Animated.Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a14",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 48,
  },
  swordsEmoji: {
    fontSize: 56,
    marginBottom: 20,
  },
  heroLine1: {
    fontSize: 44,
    fontWeight: "300",
    color: "#ffffff",
    letterSpacing: -1,
    textAlign: "center",
  },
  heroLine2: {
    fontSize: 46,
    fontWeight: "800",
    color: "#4361ee",
    letterSpacing: -1,
    textAlign: "center",
    marginTop: 2,
    textShadowColor: "rgba(67, 97, 238, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  descSection: {
    alignItems: "center",
    marginBottom: 48,
  },
  descText: {
    fontSize: 16,
    color: "#8888aa",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(26, 26, 46, 0.8)",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "rgba(67, 97, 238, 0.15)",
  },
  featureItem: {
    alignItems: "center",
    flex: 1,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  featureLabel: {
    fontSize: 11,
    color: "#666688",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
  },
  featureDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    marginHorizontal: 12,
  },
  buttonWrapper: {
    width: "100%",
    marginBottom: 32,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4361ee",
    paddingVertical: 20,
    borderRadius: 16,
    gap: 10,
    shadowColor: "#4361ee",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  ctaText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  ctaArrow: {
    fontSize: 22,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "300",
  },
  footerText: {
    fontSize: 12,
    color: "#444466",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
