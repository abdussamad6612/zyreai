# ZYREAI Android APK Build Guide

## Method 1: GitHub Actions (FREE — Koi Account Nahi Chahiye)

### Step 1: Code GitHub Pe Push Karo
```bash
git push origin main
```

### Step 2: Build Automatically Shuru Hogi
- GitHub repo → Actions tab
- "Build Android APK" workflow chalega automatically
- ~15-20 minutes lagenge

### Step 3: APK Download Karo
- Actions → Latest "Build Android APK" run
- Page ke neeche "Artifacts" section
- `zyreai-debug-apk` → Download
- ZIP extract karo → `app-debug.apk` milegi

### Step 4: Phone Me Install Karo
1. `app-debug.apk` phone me bhejo (WhatsApp, Google Drive, ya USB)
2. Phone: Settings → Security → "Unknown sources" ON karo
3. APK file open karo
4. Install dabao
5. ZYREAI app ready!

---

## Method 2: EAS Build (Expo Account Chahiye)

### Step 1: Free Account Banao
- https://expo.dev pe jao (Google se signup ho jata hai)

### Step 2: EAS CLI Use Karo
```bash
npm install -g eas-cli
eas login
cd mobile
eas build --platform android --profile preview
```

### Step 3: Dashboard Se Download Karo
- https://expo.dev → Projects → ZYREAI → Builds

---

## Notes
- Debug APK: seedha install ho jata hai, testing ke liye perfect
- Release APK: production ke liye, signing certificate chahiye hota hai
- APK size: ~80-120 MB hogi
