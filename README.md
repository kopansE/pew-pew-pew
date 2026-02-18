# PewDecide

A fun decision-maker app where your options battle it out! Enter 2-4 choices, watch them fight as colored soldiers, and let the last one standing make your decision.

## Features

- **Setup Screen**: Enter 2-4 options with color-coded inputs
- **Battle Screen**: Real-time 2D battle simulation using React Native Skia
- **Smooth 60fps animations** powered by Reanimated
- **Live HUD** showing soldier counts per team
- **Victory screen** with Rematch and Decide Again options

## Tech Stack

- Expo (SDK 51, managed workflow)
- React Native with TypeScript
- React Navigation (native stack)
- @shopify/react-native-skia for canvas rendering
- react-native-reanimated v3 for animation loop

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- For iOS: Xcode and iOS Simulator
- For Android: Android Studio and an emulator or physical device

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running the App

After running `npx expo start`, you can:

- Press `i` to open in iOS Simulator
- Press `a` to open in Android Emulator
- Scan the QR code with Expo Go on your physical device

**Note**: React Native Skia requires a development build on physical devices. Expo Go may not support all Skia features.

### Development Build (Recommended)

For full Skia support, create a development build:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Create development build for iOS
eas build --profile development --platform ios

# Create development build for Android
eas build --profile development --platform android
```

## Building for App Store / Play Store

```bash
# Build for iOS App Store
eas build --platform ios --profile production

# Build for Google Play Store
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## Project Structure

```
PewDecide/
├── App.tsx                    # Main app with navigation
├── src/
│   ├── screens/
│   │   ├── SetupScreen.tsx    # Option input screen
│   │   └── BattleScreen.tsx   # Battle simulation screen
│   ├── components/
│   │   ├── SoldierCanvas.tsx  # Skia canvas with battle logic
│   │   └── HUD.tsx            # Live soldier count display
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   └── utils/
│       └── battleEngine.ts    # Pure simulation logic
├── assets/                    # App icons and splash screen
├── app.json                   # Expo configuration
├── eas.json                   # EAS Build configuration
└── package.json
```

## Game Mechanics

- Each option spawns 20 soldiers
- Soldiers seek the nearest enemy and move toward them
- When within range (60px), soldiers fire projectiles
- Projectiles deal 1 damage (soldiers have 3 HP)
- Last team standing wins!

## Customization

You can adjust game parameters in `src/utils/battleEngine.ts`:

- `SOLDIER_SPEED`: Movement speed (default: 1.5px/tick)
- `SHOOT_RANGE`: Attack range (default: 60px)
- `SHOOT_COOLDOWN`: Frames between shots (default: 60)
- `PROJECTILE_SPEED`: Bullet speed (default: 5px/tick)
- Soldier HP, colors, and more

## License

MIT
