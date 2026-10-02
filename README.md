# NutriPlan: Personalized Diet & Nutrition App

React Native + Expo (SDK 57) + Expo Router + TypeScript (strict) + NativeWind + Zustand + React Hook Form + Zod + Reanimated + FlashList.

The app walks the user through 5 input steps (basic info, body measurements, activity, health and diet, mandatory rules), then generates a plan: daily calories, macros, water, guardrails and meals.

---

## 1. Prerequisites

| Tool | Version | Check with |
|------|---------|-----------|
| Node.js | 20 LTS or newer | `node -v` |
| npm | 10+ (ships with Node) | `npm -v` |
| Git | any | `git --version` |

Install Node from https://nodejs.org (choose LTS).

To run on a device or emulator you need **one** of:

- **A physical phone** (Android or iOS) with the Expo Go app (see the SDK note in step 4), or
- **Android Studio** with an emulator (Windows/macOS/Linux), or
- **Xcode** with an iOS Simulator (macOS only).

---

## 2. Install (Expo SDK 57)

This project targets **Expo SDK 57**, which matches the current Expo Go app. Use Node 22 LTS (`node -v`).

Open a terminal **inside the `nutriplan` folder** (the one with `package.json`) and run these commands in order (Windows `cmd` shown):

```bat
rmdir /s /q node_modules
del package-lock.json

npm install

npx expo install react react-native react-native-reanimated react-native-worklets react-native-svg react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage @shopify/flash-list expo-router expo-linking expo-constants expo-status-bar

npx expo install typescript @types/react -- --save-dev
```

(`rmdir`/`del` only matter if you tried an earlier version; ignore "not found" messages.)
The `expo install` commands pick the exact package versions that belong to SDK 57, so no version numbers are hard-coded for the native libraries.

Then check the setup:

```bat
npx expo-doctor
```

---

### If `npm install` is slow
A first install of an Expo project downloads about 1,000+ packages, so 3 to 10 minutes is normal on average Wi-Fi, and it can look frozen while it runs. The project includes an `.npmrc` that skips audit and funding checks and avoids peer-dependency errors. To speed it up further:

```bash
npm install --prefer-offline --no-audit --no-fund
# or use yarn / pnpm if you have them
npx pnpm install
```
If it is stuck for over 15 minutes, press Ctrl+C, run `npm cache verify`, delete the `node_modules` folder if it exists, and try again on a faster network.

---

## 3. Verify the nutrition engine (optional, takes 1 second)

Requires Node 22+:

```bash
npm run test:engine
```

Expected output: eight lines starting with `ok -` (BMR, TDEE, water, target calories, weeks to goal, macro totals).

Type-check the whole project:

```bash
npm run typecheck
```

---

## 4. Run the app

Start the dev server:

```bash
npx expo start -c
```

(`-c` clears the Metro cache. Use it the first time, and any time styles look wrong.)

A QR code and a menu appear in the terminal. Then choose how to open the app.

### Option A: Physical phone with Expo Go
1. Install **Expo Go** from the App Store or Google Play.
2. Phone and computer must be on the **same Wi-Fi**.
3. Android: open Expo Go and scan the QR code. iOS: scan it with the Camera app.
4. If the network blocks it, run `npx expo start --tunnel`.

This project is SDK 57, so it opens in the current Expo Go app. If Expo Go says the SDK is incompatible, update Expo Go from the store.

### Option B: Android emulator (works regardless of Expo Go version)
1. Install Android Studio, then create a virtual device in Device Manager and start it.
2. Set `ANDROID_HOME` (macOS/Linux example):
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk        # macOS
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```
3. Build and launch a development build:
   ```bash
   npx expo run:android
   ```

### Option C: iOS Simulator (macOS only)
1. Install Xcode from the App Store and open it once to accept the license.
2. Run:
   ```bash
   npx expo run:ios
   ```

---

## 5. Using the app

1. **About you:** name, age, gender, biological sex, goal, pace, target weight.
2. **Body measurements:** height, weight, waist, optional body fat (estimated if left empty). BMI shows live.
3. **Activity:** five levels mapped to multipliers 1.2 to 1.9.
4. **Health and diet:** conditions, allergies, diet style.
5. **Your rules:** minimum protein, zero added sugar, intermittent fasting window, first meal time.
6. **Dashboard:** calorie ring, how BMR leads to TDEE and target, macros, water, BMI, guardrails, meals.

Progress is saved on the device. Use **Edit my answers** or **Start over** at the bottom of the dashboard.

---

## 6. Project structure

```
app/
  _layout.tsx          root layout, loads global.css
  index.tsx            redirects to onboarding or dashboard
  onboarding.tsx       animated wizard with progress bar
  dashboard.tsx        plan summary (FlashList)
src/
  types/index.ts       UserProfile, BodyMetrics, HealthProfile, DietaryRules, CalorieTarget, ...
  lib/nutritionEngine.ts   BMR (Mifflin-St Jeor), TDEE, targets, macros, water, guardrails
  lib/mealPlanner.ts       meal timing and diet/allergy filtered suggestions
  lib/dietPlan.ts          assembles the full plan
  lib/schemas.ts           Zod schema per step
  lib/options.ts           labels for chips and choices
  store/useProfileStore.ts Zustand store persisted with AsyncStorage
  features/onboarding/steps.tsx   the 5 step forms
  components/              ui.tsx, CalorieGauge.tsx, Bars.tsx
```

---

## 7. How the calculations work

- **BMR (Mifflin-St Jeor):** `10 x kg + 6.25 x cm - 5 x age + 5` (male) or `- 161` (female)
- **TDEE:** BMR x activity multiplier (1.2, 1.375, 1.55, 1.725, 1.9)
- **Target calories:** TDEE plus or minus `weekly kg x 7700 / 7`
- **Macros:** protein by g/kg (1.4 maintain, 1.8 lose or gain, never below your floor), then the remaining calories split by diet style
- **Water:** 35 ml/kg plus an activity allowance, clamped to 1.5 to 4.5 L

Safety rules: deficit capped at 25% of TDEE; minimum 1500 kcal (male) / 1200 kcal (female); kidney disease caps protein at 0.8 g/kg; hypertension limits sodium to 1500 mg; diabetes forces zero added sugar; celiac removes gluten meals.

This is general guidance, not medical advice. Anyone with a medical condition should review the plan with a doctor or registered dietitian. The meal suggestions come from a small built-in library, so replace it with a real food database before shipping.

---

## 8. Troubleshooting

| Problem | Fix |
|---------|-----|
| Styles missing or Tailwind classes ignored | `npx expo start -c`; confirm `global.css` is imported in `app/_layout.tsx` and `metro.config.js` exists |
| `Cannot find module 'nativewind/babel'` | Run `npm install` again; make sure `babel.config.js` is in the project root |
| Reanimated error or red screen about worklets | `npx expo install react-native-reanimated`, then `npx expo start -c` |
| `Unable to resolve '@/...'` | Restart with `-c`; `tsconfig.json` must contain `"paths": { "@/*": ["src/*"] }` |
| Expo Go says incompatible SDK | Update the Expo Go app; this project is SDK 57 |
| Phone cannot connect to dev server | Same Wi-Fi, or `npx expo start --tunnel` |
| Version mismatch warnings | `npx expo install --fix`, then `npx expo-doctor` |
| `ETARGET` / version not found | Make sure `package.json` is the SDK 57 one from this zip, then run the `expo install` command in step 2 |
| Stuck on old saved answers | Tap **Start over** on the dashboard, or clear the app data / reinstall |
| Port 8081 already in use | `npx expo start --port 8082` |

---

## 9. Build for release (optional)

Using EAS (requires a free Expo account):

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview   # installable APK
eas build --platform ios                          # needs an Apple Developer account
```
