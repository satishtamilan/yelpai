// AR City Overlay - Main Application
// Yelp AI API Hackathon

// Configuration
const CONFIG = {
    YELP_API_KEY: 'PCJyCg_1zfY8RD8N36287hpNvV8xU8jeHy8dR47eNuvHhwqYzTnY3l29UaG8fM8iR3ibXY2QKGwwBpEdN8cTf1ckn0Fy5yAPTF9xDCixHxrp-BBPRQvf4jWu2gA-aXYx',
    YELP_CLIENT_ID: 'hQPqtoD-77spStHEi8Endw',
    YELP_AI_API_URL: 'https://api.yelp.com/ai/chat/v2',
    SEARCH_RADIUS: 5000, // meters - Increased for UK (less dense Yelp coverage)
    MAX_BUSINESSES: 20,
    UPDATE_INTERVAL: 30000, // 30 seconds
    USE_MOCK_DATA: false, // ✅ FALSE = Real live data from Yelp AI API
    LOCALE: 'en_GB', // UK locale
};

// Application State
let appState = {
    userLocation: null,
    deviceOrientation: null,
    businesses: [],
    selectedBusiness: null,
    isLoading: true,
};

// Initialize the application
async function initApp() {
    console.log('🚀 Initializing AR City Overlay...');
    
    // Load configuration from localStorage
    loadConfiguration();
    
    // Request permissions
    await requestPermissions();
    
    // Get user location
    await getUserLocation();
    
    // Initialize camera
    await initCamera();
    
    // Initialize device orientation tracking
    initOrientationTracking();
    
    // Fetch nearby businesses
    await fetchNearbyBusinesses();
    
    // Setup UI interactions
    setupUIInteractions();
    
    // Hide loading screen
    hideLoadingScreen();
    
    // Start periodic updates
    startPeriodicUpdates();
    
    console.log('✅ App initialized successfully!');
}

// Load configuration from localStorage
function loadConfiguration() {
    const savedConfig = localStorage.getItem('ar-city-overlay-config');
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            CONFIG.YELP_API_KEY = config.apiKey || CONFIG.YELP_API_KEY;
            CONFIG.SEARCH_RADIUS = config.searchRadius || CONFIG.SEARCH_RADIUS;
            CONFIG.MAX_BUSINESSES = config.maxBusinesses || CONFIG.MAX_BUSINESSES;
            CONFIG.USE_MOCK_DATA = config.useMockData !== undefined ? config.useMockData : CONFIG.USE_MOCK_DATA;
            
            console.log('📋 Loaded configuration:', {
                hasApiKey: CONFIG.YELP_API_KEY !== 'YOUR_YELP_API_KEY_HERE',
                radius: CONFIG.SEARCH_RADIUS,
                maxBusinesses: CONFIG.MAX_BUSINESSES,
                useMockData: CONFIG.USE_MOCK_DATA,
            });
        } catch (e) {
            console.error('Failed to load configuration:', e);
        }
    }
}

// Request necessary permissions
async function requestPermissions() {
    try {
        // Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        
        // Request device orientation permission (iOS)
        if (typeof DeviceOrientationEvent !== 'undefined' && 
            typeof DeviceOrientationEvent.requestPermission === 'function') {
            const permission = await DeviceOrientationEvent.requestPermission();
            if (permission !== 'granted') {
                throw new Error('Device orientation permission denied');
            }
        }
        
        console.log('✅ Permissions granted');
    } catch (error) {
        console.error('❌ Permission error:', error);
        showError('Please allow camera and sensor access to use AR features');
    }
}

// Get user's current location
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                appState.userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    heading: position.coords.heading || 0,
                };
                
                updateLocationDisplay();
                console.log('📍 Location:', appState.userLocation);
                resolve();
            },
            (error) => {
                console.error('❌ Location error:', error);
                // Use default location (London, UK) for demo
                appState.userLocation = { lat: 51.5074, lng: -0.1278, heading: 0 };
                updateLocationDisplay();
                resolve();
            },
            { enableHighAccuracy: true }
        );
    });
}

// Initialize camera stream
async function initCamera() {
    try {
        const video = document.getElementById('video');
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: 'environment',
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            }
        });
        
        video.srcObject = stream;
        console.log('📷 Camera initialized');
    } catch (error) {
        console.error('❌ Camera error:', error);
        showError('Failed to initialize camera');
    }
}

// Initialize device orientation tracking
function initOrientationTracking() {
    if ('ondeviceorientationabsolute' in window) {
        window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    } else if ('ondeviceorientation' in window) {
        window.addEventListener('deviceorientation', handleOrientation, true);
    } else {
        console.warn('⚠️ Device orientation not supported');
    }
    
    console.log('🧭 Orientation tracking initialized');
}

// Handle device orientation changes
function handleOrientation(event) {
    appState.deviceOrientation = {
        alpha: event.alpha, // 0-360 degrees (compass direction)
        beta: event.beta,   // -180 to 180 degrees (tilt front/back)
        gamma: event.gamma, // -90 to 90 degrees (tilt left/right)
    };
    
    // Update AR markers based on new orientation
    updateARMarkers();
}

// Fetch nearby businesses from Yelp API
async function fetchNearbyBusinesses() {
    if (!appState.userLocation) {
        console.warn('⚠️ No user location available');
        return;
    }
    
    appState.isLoading = true;
    showStatusMessage('Searching for nearby businesses...');
    
    try {
        let businesses;
        
        // Use real API or mock data based on configuration
        if (CONFIG.USE_MOCK_DATA || CONFIG.YELP_API_KEY === 'YOUR_YELP_API_KEY_HERE') {
            console.log('📝 Using mock data (add API key to use real Yelp data)');
            businesses = await getMockBusinessData();
        } else {
            console.log('🤖 Fetching from Yelp AI API...');
            console.log('📍 Location:', appState.userLocation);
            console.log('🔑 API Key configured:', CONFIG.YELP_API_KEY.substring(0, 20) + '...');
            
            try {
                YelpAI.init(CONFIG.YELP_API_KEY);
                businesses = await YelpAI.searchBusinessesWithAI(
                    appState.userLocation.lat,
                    appState.userLocation.lng,
                    CONFIG.SEARCH_RADIUS,
                    CONFIG.MAX_BUSINESSES
                );
                
                if (!businesses || businesses.length === 0) {
                    console.warn('⚠️ API returned no businesses, using fallback');
                    businesses = await getMockBusinessData();
                } else {
                    console.log('✨ Got AI-powered recommendations!', businesses.length, 'businesses');
                }
            } catch (apiError) {
                console.error('❌ API Error:', apiError);
                console.log('🔄 Falling back to mock data');
                businesses = await getMockBusinessData();
            }
        }
        
        // Calculate bearing and distance for each business
        appState.businesses = businesses.map(business => ({
            ...business,
            bearing: calculateBearing(
                appState.userLocation.lat,
                appState.userLocation.lng,
                business.coordinates.latitude,
                business.coordinates.longitude
            ),
            distance: calculateDistance(
                appState.userLocation.lat,
                appState.userLocation.lng,
                business.coordinates.latitude,
                business.coordinates.longitude
            ),
        }));
        
        // Sort by distance
        appState.businesses.sort((a, b) => a.distance - b.distance);
        
        // Update UI
        updateBusinessList();
        updateARMarkers();
        updateBusinessCount();
        
        console.log(`✅ Loaded ${appState.businesses.length} businesses`);
        hideStatusMessage();
    } catch (error) {
        console.error('❌ Failed to fetch businesses:', error);
        showError('Failed to load businesses');
    } finally {
        appState.isLoading = false;
    }
}

// Get mock business data (replace with real Yelp AI API call)
async function getMockBusinessData() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data around user location (UK-themed for demo)
    const mockBusinesses = [
        {
            id: '1',
            name: 'The Ivy Restaurant',
            rating: 4.5,
            price: '£££',
            categories: [{ title: 'British' }],
            coordinates: {
                latitude: appState.userLocation.lat + 0.002,
                longitude: appState.userLocation.lng + 0.002,
            },
            ai_tip: 'Classic British dining with a modern twist. Great Sunday roast!',
        },
        {
            id: '2',
            name: 'Wagamama',
            rating: 4.4,
            price: '££',
            categories: [{ title: 'Asian' }],
            coordinates: {
                latitude: appState.userLocation.lat - 0.001,
                longitude: appState.userLocation.lng + 0.003,
            },
            ai_tip: 'Fresh ramen and Asian dishes. Try the chicken katsu curry.',
        },
        {
            id: '3',
            name: 'Costa Coffee',
            rating: 4.2,
            price: '£',
            categories: [{ title: 'Coffee' }],
            coordinates: {
                latitude: appState.userLocation.lat + 0.001,
                longitude: appState.userLocation.lng - 0.002,
            },
            ai_tip: 'Perfect spot for a quick coffee and pastry.',
        },
        {
            id: '4',
            name: 'Five Guys',
            rating: 4.6,
            price: '££',
            categories: [{ title: 'Burgers' }],
            coordinates: {
                latitude: appState.userLocation.lat - 0.002,
                longitude: appState.userLocation.lng - 0.001,
            },
            ai_tip: 'Customizable burgers with unlimited toppings. Cajun fries are a must!',
        },
        {
            id: '5',
            name: 'Nando\'s',
            rating: 4.5,
            price: '££',
            categories: [{ title: 'Portuguese' }],
            coordinates: {
                latitude: appState.userLocation.lat + 0.003,
                longitude: appState.userLocation.lng - 0.001,
            },
            ai_tip: 'Famous for peri-peri chicken. Start with medium spice if unsure!',
        },
        {
            id: '6',
            name: 'Dishoom',
            rating: 4.7,
            price: '£££',
            categories: [{ title: 'Indian' }],
            coordinates: {
                latitude: appState.userLocation.lat + 0.001,
                longitude: appState.userLocation.lng + 0.002,
            },
            ai_tip: 'Bombay-inspired cafe with exceptional breakfast and house chai.',
        },
    ];
    
    return mockBusinesses;
}

// Calculate bearing between two points
function calculateBearing(lat1, lng1, lat2, lng2) {
    const dLng = toRadians(lng2 - lng1);
    const y = Math.sin(dLng) * Math.cos(toRadians(lat2));
    const x = Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
              Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLng);
    const bearing = toDegrees(Math.atan2(y, x));
    return (bearing + 360) % 360; // Normalize to 0-360
}

// Calculate distance between two points (Haversine formula)
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

// Update AR markers on screen
function updateARMarkers() {
    if (!appState.deviceOrientation || appState.businesses.length === 0) {
        return;
    }
    
    const container = document.getElementById('ar-markers');
    container.innerHTML = '';
    
    const deviceHeading = appState.deviceOrientation.alpha || 0;
    const screenWidth = window.innerWidth;
    const fov = 60; // Field of view in degrees
    
    appState.businesses.forEach(business => {
        // Calculate relative angle
        let relativeAngle = business.bearing - deviceHeading;
        
        // Normalize angle to -180 to 180
        while (relativeAngle > 180) relativeAngle -= 360;
        while (relativeAngle < -180) relativeAngle += 360;
        
        // Only show businesses within field of view
        if (Math.abs(relativeAngle) < fov / 2 && business.distance < 500) {
            const marker = createARMarker(business, relativeAngle, screenWidth, fov);
            container.appendChild(marker);
        }
    });
}

// Create AR marker element
function createARMarker(business, relativeAngle, screenWidth, fov) {
    const marker = document.createElement('div');
    marker.className = 'ar-marker';
    marker.textContent = `${business.name} • ${formatDistance(business.distance)}`;
    
    // Calculate screen position
    const x = (relativeAngle / fov) * screenWidth + screenWidth / 2;
    const y = window.innerHeight * 0.4; // Place markers in upper-middle area
    
    marker.style.left = `${x}px`;
    marker.style.top = `${y}px`;
    
    // Add click handler
    marker.addEventListener('click', () => {
        selectBusiness(business);
    });
    
    return marker;
}

// Update business list in bottom panel
function updateBusinessList() {
    const listContainer = document.getElementById('business-list');
    listContainer.innerHTML = '';
    
    if (appState.businesses.length === 0) {
        listContainer.innerHTML = '<p style="color: #999; text-align: center;">No businesses found nearby</p>';
        return;
    }
    
    appState.businesses.forEach(business => {
        const card = createBusinessCard(business);
        listContainer.appendChild(card);
    });
}

// Create business card element
function createBusinessCard(business) {
    const card = document.createElement('div');
    card.className = 'business-card';
    
    card.innerHTML = `
        <div class="business-name">${business.name}</div>
        <div class="business-rating">⭐ ${business.rating} • ${business.price} • ${business.categories[0].title}</div>
        <div class="business-distance">📍 ${formatDistance(business.distance)} away</div>
        <div class="business-ai-tip">🤖 AI Insight: ${business.ai_tip}</div>
        ${business.ai_summary ? `<div class="business-ai-summary" style="margin-top: 10px; color: #666; font-size: 12px; font-style: italic;">${business.ai_summary}</div>` : ''}
    `;
    
    card.addEventListener('click', () => {
        selectBusiness(business);
    });
    
    return card;
}

// Select a business
function selectBusiness(business) {
    appState.selectedBusiness = business;
    console.log('Selected business:', business);
    
    // Expand bottom panel
    const panel = document.getElementById('bottom-panel');
    panel.classList.add('expanded');
    
    // Scroll to selected business in list
    const cards = document.querySelectorAll('.business-card');
    cards.forEach((card, index) => {
        if (appState.businesses[index].id === business.id) {
            card.style.background = '#f0f0f0';
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            card.style.background = 'white';
        }
    });
}

// Setup UI interactions
function setupUIInteractions() {
    // Panel handle toggle
    const panelHandle = document.getElementById('panel-handle');
    const bottomPanel = document.getElementById('bottom-panel');
    
    panelHandle.addEventListener('click', () => {
        bottomPanel.classList.toggle('expanded');
    });
    
    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    refreshBtn.addEventListener('click', async () => {
        refreshBtn.textContent = '⏳';
        await getUserLocation();
        await fetchNearbyBusinesses();
        refreshBtn.textContent = '🔄';
    });
    
    // Filter button (placeholder for future feature)
    const filterBtn = document.getElementById('filter-btn');
    filterBtn.addEventListener('click', () => {
        alert('Filter feature coming soon!');
    });
}

// Update location display
function updateLocationDisplay() {
    const locationInfo = document.getElementById('location-info');
    if (appState.userLocation) {
        locationInfo.textContent = `📍 ${appState.userLocation.lat.toFixed(4)}, ${appState.userLocation.lng.toFixed(4)}`;
    }
}

// Update business count
function updateBusinessCount() {
    const countElement = document.getElementById('business-count');
    countElement.textContent = `${appState.businesses.length} businesses`;
}

// Show status message
function showStatusMessage(message) {
    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = message;
    statusMessage.style.display = 'block';
}

// Hide status message
function hideStatusMessage() {
    const statusMessage = document.getElementById('status-message');
    statusMessage.style.display = 'none';
}

// Show error message
function showError(message) {
    console.error('❌', message);
    showStatusMessage(`❌ ${message}`);
    setTimeout(hideStatusMessage, 5000);
}

// Hide loading screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        showStatusMessage('Point your camera at buildings around you');
        setTimeout(hideStatusMessage, 3000);
    }, 1500);
}

// Start periodic updates
function startPeriodicUpdates() {
    setInterval(() => {
        if (!appState.isLoading) {
            fetchNearbyBusinesses();
        }
    }, CONFIG.UPDATE_INTERVAL);
}

// Utility functions
function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

function toDegrees(radians) {
    return radians * 180 / Math.PI;
}

function formatDistance(meters) {
    if (meters < 1000) {
        return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

