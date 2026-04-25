# Red Renote

Expo React Native shell for an iOS-first AI meeting assistant.

## Stack

- Expo SDK 55
- React Native 0.83
- TypeScript
- Expo Router
- NativeWind
- Zustand
- React Hook Form
- Lucide React Native icons
- React Native Safe Area Context

## Structure

```txt
app/
  _layout.tsx                Root providers and stack
  index.tsx                  Entry redirect
  (onboarding)/              First-run route group
  (tabs)/                    Main app tabs
  (modals)/                  Modal flows such as recording
src/
  components/
    meeting/                 Meeting-specific reusable UI
    shell/                   App chrome and recording shell controls
    ui/                      Base primitives
  constants/                 Design tokens and route metadata
  data/                      Mock shell data
  lib/                       Shared utilities
  store/                     Zustand stores
  types/                     Domain types
```

## Design Direction

Red Renote uses a clean business productivity UI with a red primary action system. The app shell keeps the interface quiet and mobile-first, reserving the red brand color for recording, AI actions, and high-priority state.

## Commands

```bash
npm install
npm run start
npm run typecheck
```
