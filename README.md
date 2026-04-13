# Gainz — Weight Training Tracker

A cross-platform weight training tracker for iOS, Android, and web. Built with React Native (Expo), SQLite, and TypeScript.

## Features

- **Exercise Library** — 76 curated exercises with muscle groups, equipment, difficulty, and instructions
- **Workout Logging** — Log sets (weight + reps) in real-time with a running timer
- **Personal Records** — Automatically detects new PRs (max weight, estimated 1RM) when you finish a workout
- **Workout History** — See all past sessions with duration, exercises, and sets completed
- **Exercise Detail** — View per-exercise history, PRs, and step-by-step instructions
- **Offline-first** — Everything runs locally on-device with SQLite (no account needed)

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | React Native + Expo (SDK 54) |
| Routing | expo-router v4 |
| Database | expo-sqlite + Drizzle ORM |
| State | @tanstack/react-query |
| Styling | NativeWind (Tailwind CSS) |
| Language | TypeScript |

## Getting Started

```bash
npm install
npx expo start
```

- Press `w` to open in browser
- Scan the QR code with Expo Go on your phone (iOS/Android)

On first launch the app auto-runs database migrations and seeds the exercise library.

## Project Structure

```
src/
├── app/              # Expo Router screens
│   ├── (tabs)/       # Dashboard, Exercises, Plans, History, Profile
│   ├── workout/      # Active workout + post-workout summary
│   └── exercise/     # Exercise detail + in-workout exercise picker
├── db/
│   ├── schema/       # Drizzle ORM schema (14 tables)
│   ├── migrations/   # Auto-generated SQL migrations
│   └── seed/         # 76 exercises, muscle groups, equipment
├── services/         # Business logic (exercise, template, session, progress)
├── hooks/            # React Query data hooks
├── components/       # UI and feature components
└── utils/            # Units, 1RM formulas, volume, dates
```

## Roadmap

- [ ] Training templates (reusable workout blueprints)
- [ ] Training plans (weekly schedules)
- [ ] Progress charts (weight over time, estimated 1RM trends)
- [ ] Apple Health / Google Health Connect integration
- [ ] Cloud sync + Google login (via Supabase)
- [ ] Payment integration for premium sync tier
