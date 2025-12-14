# 🚀 Deployment Guide

## 📂 Project Structure

```
/Users/sanandhan/code/
├── yelp/                          # Main web app (THIS FOLDER)
│   ├── voice-app.html             # Voice-first app
│   ├── voice-app.js               # App logic
│   ├── index.html                 # AR app (backup)
│   ├── firebase.json              # Firebase config
│   └── .git/                      # Git repository
│
└── yelp-flutter-app/              # Flutter app (SEPARATE)
    ├── lib/
    ├── android/
    └── pubspec.yaml
```

---

## 🔥 Firebase Deployment (Web App)

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Initialize Firebase (in main project)
```bash
cd /Users/sanandhan/code/yelp
firebase init hosting
```

**Settings:**
- Use existing project or create new
- Public directory: `.` (current directory)
- Single-page app: `Yes`
- Set up automatic builds: `No`

### Step 4: Deploy
```bash
firebase deploy --only hosting
```

**Your app will be at:**
```
https://your-project-id.web.app
```

---

## 📱 Flutter App (Separate Project)

### Location:
```
/Users/sanandhan/code/yelp-flutter-app/
```

### Build APK:
```bash
cd /Users/sanandhan/code/yelp-flutter-app
flutter pub get
flutter build apk --release
```

**APK location:**
```
build/app/outputs/flutter-apk/app-release.apk
```

---

## 🗂️ Git Setup

### For Web App (Main Project):
```bash
cd /Users/sanandhan/code/yelp

# Initialize git (if not already)
git init

# Add files
git add .
git commit -m "Initial commit: Voice-First Discovery web app"

# Create GitHub repo (on github.com)
# Then connect:
git remote add origin https://github.com/YOUR_USERNAME/yelp-voice-discovery.git
git branch -M main
git push -u origin main
```

### For Flutter App (Separate):
```bash
cd /Users/sanandhan/code/yelp-flutter-app

# Initialize separate git repo
git init
git add .
git commit -m "Initial commit: Flutter mobile app"

# Create separate GitHub repo
git remote add origin https://github.com/YOUR_USERNAME/yelp-voice-flutter.git
git branch -M main
git push -u origin main
```

---

## 🎯 What to Submit to Hackathon

### Primary Submission (Web App):
- **Live URL:** https://your-project.web.app
- **GitHub:** https://github.com/YOUR_USERNAME/yelp-voice-discovery
- **Type:** Web Application
- **Access:** Instant (just URL)

### Optional (Flutter App):
- **APK:** Upload to Devpost
- **GitHub:** https://github.com/YOUR_USERNAME/yelp-voice-flutter
- **Note:** "Also available as native Android app"

---

## ⚡ Quick Deploy Commands

### Web App to Firebase:
```bash
cd /Users/sanandhan/code/yelp
firebase deploy
```

### Web App to Vercel (Alternative):
```bash
cd /Users/sanandhan/code/yelp
npx vercel
```

### Web App to Netlify (Alternative):
```bash
cd /Users/sanandhan/code/yelp
npx netlify-cli deploy --prod
```

---

## 📋 Pre-Deployment Checklist

### Web App:
- [ ] Test voice recognition works
- [ ] Test location detection
- [ ] Test on mobile browser
- [ ] Remove any test API keys
- [ ] Update README with live URL
- [ ] Test all suggestion chips
- [ ] Check console for errors

### Git:
- [ ] .gitignore is configured
- [ ] No sensitive data committed
- [ ] README is complete
- [ ] All files added
- [ ] Clean commit history

---

## 🔒 Security Note

**IMPORTANT:** Your API key is in the code!

### For Hackathon (Quick Fix):
```javascript
// In voice-app.js, add note:
// Note: In production, API key should be in environment variables
// For hackathon demo purposes only
const CONFIG = {
    YELP_API_KEY: 'your-key-here',
    // ...
};
```

### For Production (After Hackathon):
Use Firebase Functions or backend proxy to hide API key.

---

## 🎬 Deployment Steps (Right Now)

### 1. Deploy Web App (15 minutes):
```bash
cd /Users/sanandhan/code/yelp
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### 2. Setup Git (10 minutes):
```bash
cd /Users/sanandhan/code/yelp
git init
git add .
git commit -m "Voice-First Discovery - Yelp AI Hackathon"
# Create repo on GitHub
git remote add origin YOUR_REPO_URL
git push -u origin main
```

### 3. Update README with URLs (5 minutes):
Add live URL and repo link to README.md

---

## 🏆 For Hackathon Submission

### Required URLs:
1. **Live Demo:** https://your-app.web.app ← Deploy to get this
2. **Source Code:** https://github.com/username/repo ← Git push to get this
3. **Demo Video:** Upload to YouTube/Vimeo

### Optional:
4. **Flutter APK:** Upload if ready
5. **Second Repo:** Flutter app GitHub

---

## 💡 Recommended: Focus on Web App

**Why:**
- ✅ Judges can test instantly
- ✅ Works on all devices
- ✅ Easier to deploy
- ✅ Easier to demo in video

**Flutter app = Nice bonus, not required**

---

Ready to deploy? Tell me:
- **"deploy firebase"** - I'll guide you through Firebase
- **"setup git"** - I'll help with GitHub
- **"both"** - Let's do both!

What's your priority? 🚀

