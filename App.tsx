import 'react-native-reanimated';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HomeScreen } from './src/screens/HomeScreen';
import { SetupScreen } from './src/screens/SetupScreen';
import { BattleScreen } from './src/screens/BattleScreen';
import { BattleOption } from './src/types';

type RootStackParamList = {
  Home: undefined;
  Setup: { previousOptions?: BattleOption[]; previousFortHp?: number } | undefined;
  Battle: { options: BattleOption[]; fortHp: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: '#0f0f1a' },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Setup" component={SetupScreen} />
          <Stack.Screen name="Battle" component={BattleScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
