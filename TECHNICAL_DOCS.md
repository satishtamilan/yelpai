# AR City Overlay - Development Documentation

## 🏗️ Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                       User Interface                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Top Bar   │  │  AR Markers  │  │  Bottom Panel    │  │
│  │  (Status)   │  │   Overlay    │  │ (Business List)  │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Logic                        │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   GPS/       │  │   Device     │  │   AR Marker     │  │
│  │  Location    │  │ Orientation  │  │   Rendering     │  │
│  │   Tracking   │  │  (Compass)   │  │    Engine       │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  Yelp AI API │  │  Local Cache │  │  Configuration  │  │
│  │  Integration │  │   Storage    │  │    Manager      │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     Device Hardware                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Camera     │  │     GPS      │  │  Gyroscope/     │  │
│  │              │  │              │  │   Compass       │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 📁 File Structure

```
/Users/sanandhan/code/yelp/
├── index.html              # Main AR app
├── app.js                  # Core application logic
├── yelp-api.js            # Yelp API integration
├── ui-enhancements.js     # UI animations and polish
├── config.html            # Configuration page
├── SETUP.html             # Setup instructions
├── README.md              # Project documentation
├── SUBMISSION_CHECKLIST.md # Hackathon submission guide
├── VIDEO_GUIDE.md         # Demo video creation guide
├── demo-video-script.js   # Video script template
├── package.json           # NPM configuration
└── .gitignore            # Git ignore rules
```

## 🔧 Core Technologies

### Frontend Stack
- **HTML5**: Structure and camera API
- **CSS3**: Styling with modern features (backdrop-filter, gradients)
- **Vanilla JavaScript**: No frameworks for maximum performance
- **Web APIs**:
  - Geolocation API (GPS tracking)
  - Device Orientation API (Compass)
  - MediaDevices API (Camera)
  - Local Storage API (Configuration)

### AR Technology
- **GPS-based AR**: Position markers using latitude/longitude
- **Compass tracking**: Device orientation for direction
- **Field of view calculation**: Show only relevant businesses
- **Distance-based rendering**: Optimize for performance

### External APIs
- **Yelp Fusion API**: Business search and data
- **Yelp AI API**: (Future) Conversational recommendations

## 🧮 Key Algorithms

### 1. Bearing Calculation (Direction to Business)

```javascript
function calculateBearing(lat1, lng1, lat2, lng2) {
    const dLng = toRadians(lng2 - lng1);
    const y = Math.sin(dLng) * Math.cos(toRadians(lat2));
    const x = Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
              Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLng);
    const bearing = toDegrees(Math.atan2(y, x));
    return (bearing + 360) % 360; // Normalize to 0-360
}
```

**What it does:**
- Calculates the compass bearing from user to business
- Returns angle in degrees (0° = North, 90° = East, etc.)
- Used to determine if business is in field of view

### 2. Distance Calculation (Haversine Formula)

```javascript
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δφ = toRadians(lat2 - lat1);
    const Δλ = toRadians(lng2 - lng1);
    
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c; // Distance in meters
}
```

**What it does:**
- Calculates great-circle distance between two GPS coordinates
- Accounts for Earth's curvature (accurate for any distance)
- Returns distance in meters

### 3. AR Marker Positioning

```javascript
function positionMarker(business, deviceHeading, screenWidth, fov) {
    // Calculate relative angle
    let relativeAngle = business.bearing - deviceHeading;
    
    // Normalize to -180 to 180
    while (relativeAngle > 180) relativeAngle -= 360;
    while (relativeAngle < -180) relativeAngle += 360;
    
    // Check if in field of view
    if (Math.abs(relativeAngle) < fov / 2) {
        // Convert angle to screen position
        const x = (relativeAngle / fov) * screenWidth + screenWidth / 2;
        return { visible: true, x, y: window.innerHeight * 0.4 };
    }
    
    return { visible: false };
}
```

**What it does:**
- Determines if business is visible in current camera view
- Converts real-world bearing to screen coordinates
- Returns pixel position for AR marker

## 🔄 Application Flow

### Initialization Sequence

1. **Load Configuration**
   ```
   localStorage → CONFIG object → Initialize settings
   ```

2. **Request Permissions**
   ```
   Camera → Location → Device Orientation (iOS)
   ```

3. **Get User Location**
   ```
   Geolocation API → Store lat/lng → Update UI
   ```

4. **Initialize Camera**
   ```
   MediaDevices API → Stream to video element → Show live feed
   ```

5. **Start Orientation Tracking**
   ```
   DeviceOrientation listener → Update heading → Refresh markers
   ```

6. **Fetch Businesses**
   ```
   Yelp API / Mock data → Calculate bearing/distance → Store in state
   ```

7. **Render UI**
   ```
   Create AR markers → Update business list → Hide loading screen
   ```

### Update Cycle

```
Device Orientation Change
    ↓
Update device heading
    ↓
Calculate which businesses are in FOV
    ↓
Update AR marker positions
    ↓
Render changes (60fps target)
```

## 🎨 UI/UX Design Decisions

### Color Scheme
- **Primary Red**: `#d32323` (Yelp brand color)
- **Dark Red**: `#b01d1d` (Hover states)
- **White/Light Gray**: Text and backgrounds
- **Semi-transparent**: Overlays for better readability

### Layout Philosophy
- **Camera-first**: Full-screen camera feed
- **Minimal UI**: Don't obstruct the AR view
- **Bottom-anchored**: Main controls at bottom (thumb-friendly)
- **Gesture-based**: Swipe to expand, tap to interact

### Accessibility
- **High contrast**: Text always readable
- **Large touch targets**: Minimum 44x44px
- **Visual feedback**: Immediate response to interactions
- **Error messages**: Clear and helpful

## 📊 Performance Optimizations

### 1. Rendering Optimization
```javascript
// Only update markers when orientation changes significantly
const ORIENTATION_THRESHOLD = 2; // degrees
if (Math.abs(newHeading - oldHeading) > ORIENTATION_THRESHOLD) {
    updateARMarkers();
}
```

### 2. Business Filtering
```javascript
// Only show businesses within reasonable distance
const MAX_DISPLAY_DISTANCE = 500; // meters
businesses.filter(b => b.distance < MAX_DISPLAY_DISTANCE);
```

### 3. Debounced Updates
```javascript
// Prevent excessive API calls
const UPDATE_INTERVAL = 30000; // 30 seconds
```

### 4. Lazy Loading
```javascript
// Load business details only when clicked
async function selectBusiness(business) {
    if (!business.detailsLoaded) {
        business.details = await fetchBusinessDetails(business.id);
        business.detailsLoaded = true;
    }
}
```

## 🐛 Common Issues & Solutions

### Issue 1: Compass Not Working on iOS
**Problem**: Safari requires explicit permission for device orientation

**Solution**:
```javascript
if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    const permission = await DeviceOrientationEvent.requestPermission();
    if (permission === 'granted') {
        window.addEventListener('deviceorientationabsolute', handleOrientation);
    }
}
```

### Issue 2: GPS Inaccuracy Indoors
**Problem**: GPS signals are weak inside buildings

**Solution**:
- Enable mock data mode for testing
- Test outdoors when possible
- Increase search radius to compensate

### Issue 3: Camera Permissions Denied
**Problem**: User denies camera access

**Solution**:
```javascript
try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
} catch (error) {
    showError('Camera access required. Please enable in settings.');
    // Show instructions for enabling camera
}
```

### Issue 4: AR Markers Jittering
**Problem**: Compass readings fluctuate rapidly

**Solution**:
```javascript
// Apply simple smoothing filter
let smoothedHeading = heading;
const SMOOTHING_FACTOR = 0.8;
smoothedHeading = smoothedHeading * SMOOTHING_FACTOR + 
                  lastHeading * (1 - SMOOTHING_FACTOR);
```

## 🔐 Security Considerations

### API Key Protection
- **Never commit API keys**: Use `.gitignore`
- **Environment variables**: For production deployment
- **Backend proxy**: Recommended for production
- **Rate limiting**: Respect API limits

### User Privacy
- **Location data**: Never stored or transmitted except to Yelp API
- **Camera feed**: Processed locally, never uploaded
- **No tracking**: No analytics or user tracking implemented

## 🚀 Deployment

### Recommended Platforms

1. **Vercel** (Best choice)
   - Free tier available
   - Automatic HTTPS
   - Fast global CDN
   - Easy GitHub integration

2. **Netlify**
   - Similar to Vercel
   - Drag-and-drop deployment
   - Good for static sites

3. **GitHub Pages**
   - Free hosting
   - Simple setup
   - HTTPS included

### Environment Variables (for production)

```bash
YELP_API_KEY=your_actual_api_key
YELP_CLIENT_ID=your_client_id
```

## 📈 Future Enhancements

### Phase 1: Core Features
- [ ] Real Yelp AI API integration
- [ ] Restaurant reservation system
- [ ] Filter by category/price/rating
- [ ] Save favorite businesses

### Phase 2: Advanced AR
- [ ] 3D business models
- [ ] Indoor AR (malls, airports)
- [ ] AR navigation arrows
- [ ] Distance indicators on screen

### Phase 3: Social Features
- [ ] Share discoveries with friends
- [ ] User reviews and photos
- [ ] Check-in system
- [ ] Social recommendations

### Phase 4: AI Enhancements
- [ ] Voice commands
- [ ] Personalized recommendations
- [ ] Natural language search
- [ ] Predictive suggestions

## 📚 Additional Resources

### Documentation
- [Yelp Fusion API Docs](https://www.yelp.com/developers/documentation/v3)
- [MDN Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)
- [WebXR Device API](https://immersiveweb.dev/)

### Learning Resources
- [GPS-based AR Tutorial](https://ar-js-org.github.io/AR.js-Docs/)
- [Device Orientation Guide](https://developer.mozilla.org/en-US/docs/Web/API/Device_orientation_events)
- [Haversine Formula Explained](https://www.movable-type.co.uk/scripts/latlong.html)

## 👥 Contributing

This is a hackathon project, but feel free to fork and improve!

### Code Style
- Use clear variable names
- Comment complex algorithms
- Follow existing patterns
- Keep functions small and focused

### Testing
- Test on multiple devices
- Verify in different browsers
- Check edge cases (no GPS, no camera, etc.)
- Test with different data sizes

---

Built with ❤️ for the Yelp AI API Hackathon

