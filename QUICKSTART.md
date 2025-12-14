# 🚀 QUICK START - AR City Overlay

**Get your AR app running in 5 minutes!**

---

## ⚡ Fastest Way (Mock Data)

1. **Open in browser**
   ```bash
   cd /Users/sanandhan/code/yelp
   open index.html
   ```
   
2. **Allow permissions** when prompted:
   - ✅ Camera
   - ✅ Location
   - ✅ Device orientation (iOS)

3. **Done!** You're now seeing AR overlays with mock business data.

---

## 🔑 With Real Yelp Data (Recommended)

### Step 1: Get API Key (5 minutes)
1. Go to https://www.yelp.com/developers
2. Sign up / Log in
3. Create a new app
4. Copy your API key

### Step 2: Configure (1 minute)
```bash
cd /Users/sanandhan/code/yelp
open config.html
```
- Paste your API key
- Uncheck "Use Mock Data"
- Click "Save Config"
- Click "Launch App"

### Step 3: Test (2 minutes)
- Point camera at buildings
- See real businesses appear
- Tap markers for details
- Enjoy!

---

## 📱 Test on Mobile (Best Experience)

### Option A: Local Network
```bash
# Start server
npm run dev

# Or if you don't have npm:
python3 -m http.server 3000
```

Then open on your phone: `http://YOUR_COMPUTER_IP:3000`

### Option B: Public URL (with ngrok)
```bash
# Terminal 1: Start server
npx serve -s . -l 3000

# Terminal 2: Create tunnel
npx ngrok http 3000
```

Use the HTTPS URL on your phone!

---

## 🎯 File Overview

```
📂 Your Project
├── 🌐 index.html           ← Main AR app (START HERE)
├── ⚙️  config.html          ← Configuration page
├── 📖 SETUP.html            ← Detailed setup guide
│
├── 🎨 app.js                ← Core app logic
├── 🔌 yelp-api.js           ← Yelp API integration
├── ✨ ui-enhancements.js    ← Animations & polish
│
├── 📚 README.md             ← Project overview
├── ✅ SUBMISSION_CHECKLIST  ← Hackathon submission guide
├── 🎥 VIDEO_GUIDE           ← How to make demo video
├── 🔧 TECHNICAL_DOCS        ← Architecture & algorithms
│
└── 📦 package.json          ← Dependencies & scripts
```

---

## 🐛 Troubleshooting

### "Camera not working"
- ✅ Use HTTPS (required for camera)
- ✅ Allow camera permission
- ✅ Try different browser (Chrome recommended)

### "No businesses showing"
- ✅ Check if GPS is enabled
- ✅ Try outdoors (better GPS signal)
- ✅ Enable mock data mode in config

### "AR markers not appearing"
- ✅ Allow device orientation permission (iOS)
- ✅ Move camera around slowly
- ✅ Point at different directions

### "API errors"
- ✅ Check API key is correct
- ✅ Verify API key has no extra spaces
- ✅ Enable mock data to test without API

---

## 📋 Next Steps

### For Testing:
1. ✅ Test on mobile device
2. ✅ Try in different locations
3. ✅ Test all features (tap, swipe, refresh)
4. ✅ Verify on iOS and Android

### For Hackathon Submission:
1. 📹 Record demo video (see VIDEO_GUIDE.md)
2. 🌐 Deploy to hosting (Vercel/Netlify)
3. 📝 Fill out SUBMISSION_CHECKLIST.md
4. 🚀 Submit to Devpost!

---

## 💡 Pro Tips

1. **Best Testing Location**: Downtown area with many businesses
2. **Best Time**: Daytime with good lighting
3. **Best Device**: Modern smartphone (iPhone 12+, Android flagship)
4. **Best Browser**: Chrome (mobile) or Safari (iOS)

---

## 🆘 Need Help?

1. Check `SETUP.html` for detailed instructions
2. Read `TECHNICAL_DOCS.md` for architecture
3. See `README.md` for feature overview
4. Open an issue on GitHub

---

## 📞 Quick Commands Reference

```bash
# Install dependencies (optional)
npm install

# Start development server
npm run dev

# Start simple server
npx serve -s . -l 3000

# Create public tunnel
npx ngrok http 3000

# Deploy to Vercel
vercel

# Deploy to Netlify
netlify deploy --prod
```

---

## ⏰ Hackathon Timeline

**Deadline**: December 17, 2025 @ 5:00pm EST

**Time left**: ~4 days

**Recommended schedule**:
- Day 1: ✅ Setup & test app (DONE!)
- Day 2: 🎥 Record demo video
- Day 3: 🌐 Deploy & polish
- Day 4: 📝 Submit & final checks

---

## 🎉 You're Ready!

Your AR City Overlay app is **fully functional** and ready to test!

**Next action**: 
```bash
open index.html
```

Or open `config.html` to add your Yelp API key.

**Good luck with the hackathon! 🍀**

---

Built with ❤️ for the Yelp AI API Hackathon

