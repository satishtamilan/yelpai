# 🇬🇧 UK-Specific Setup Notes

## Important: Yelp Coverage in the UK

### Yelp's UK Presence
⚠️ **Important:** Yelp has **limited coverage in the UK** compared to the United States. 

- ✅ Major cities (London, Manchester, Edinburgh, Birmingham) have good coverage
- ⚠️ Smaller towns and rural areas may have few or no listings
- 🌍 Yelp is primarily a US-focused platform

### What This Means for Your App

1. **In Major UK Cities:**
   - ✅ You should see real businesses from Yelp
   - ✅ AI recommendations will work
   - ✅ Live data available

2. **In Smaller UK Towns:**
   - ⚠️ May return few or no results
   - 🔄 App will fall back to demo data
   - 💡 Consider increasing search radius

3. **For Demo Purposes:**
   - ✅ Mock data now uses UK-themed businesses
   - ✅ Prices shown in £ instead of $
   - ✅ UK locale (en_GB) configured

---

## Configuration Adjustments for UK

### Search Radius
```javascript
SEARCH_RADIUS: 5000  // Increased to 5km (was 1km)
```

### Locale
```javascript
LOCALE: 'en_GB'  // UK English
```

### Default Location
```javascript
// London coordinates used as fallback
lat: 51.5074, lng: -0.1278
```

---

## Testing Recommendations

### Best Test Locations in UK:
1. **London** - Best Yelp coverage
   - Central London
   - Covent Garden
   - Shoreditch
   
2. **Manchester** - Good coverage
   - City Centre
   - Northern Quarter

3. **Edinburgh** - Moderate coverage
   - Old Town
   - New Town

4. **Birmingham** - Moderate coverage
   - City Centre

---

## Alternative for Demo

If Yelp returns limited UK data, your app will:
1. ✅ Try real Yelp AI API first
2. 🔄 Fall back to UK-themed mock data
3. 📝 Display clear message in console

This ensures your demo works smoothly for the hackathon judges!

---

## For Production

Consider:
- 🌍 Adding Google Places API for UK coverage
- 🗺️ Using Foursquare API (better UK presence)
- 🇬🇧 Adding TripAdvisor API for UK restaurants
- 💡 Hybrid approach: Yelp where available, alternatives elsewhere

---

## Hackathon Judges

**Important:** Mention in your demo that:
- ✅ App is configured for both US and UK
- ✅ Uses Yelp AI API where data is available
- ✅ Gracefully falls back for areas with limited coverage
- ✅ Easy to configure for any region/locale

This shows good software engineering practices!

