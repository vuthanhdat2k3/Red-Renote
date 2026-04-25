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
- Supabase
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
  hooks/                     Data-loading hooks
  lib/                       Shared utilities
  store/                     Zustand stores
  types/                     Domain types
supabase/
  migrations/                Database schema and seed data
```

## Design Direction

Red Renote uses a clean business productivity UI with a red primary action system. The app shell keeps the interface quiet and mobile-first, reserving the red brand color for recording, AI actions, and high-priority state.

## Commands

```bash
npm install
npm run start
npm run typecheck
```

## Supabase

Create a Supabase project, then copy `.env.example` to `.env.local` and fill in:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Apply the schema and seed data from `supabase/migrations/202604250001_initial_schema.sql` in the Supabase SQL editor or with the Supabase CLI. The app reads from Supabase when both env values are present and falls back to local mock data during development.
