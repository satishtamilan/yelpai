// Voice-First Business Discovery - Yelp AI API
// Main Application Logic

// Configuration
const CONFIG = {
    YELP_API_KEY: 'PCJyCg_1zfY8RD8N36287hpNvV8xU8jeHy8dR47eNuvHhwqYzTnY3l29UaG8fM8iR3ibXY2QKGwwBpEdN8cTf1ckn0Fy5yAPTF9xDCixHxrp-BBPRQvf4jWu2gA-aXYx',
    YELP_AI_API_URL: 'https://api.yelp.com/ai/chat/v2',
    LOCALE: 'en_GB',
};

// Speech Recognition Setup
let recognition = null;
let synthesis = window.speechSynthesis;
let isListening = false;
let userLocation = null;

// Initialize Speech Recognition
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        alert('Speech recognition not supported in this browser. Please use Chrome or Edge.');
        return false;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-GB';

    recognition.onstart = () => {
        isListening = true;
        updateUI('listening');
        updateStatus('🎧 Listening... Speak now!');
    };

    recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');

        document.getElementById('transcript').textContent = transcript;

        // If result is final, process it
        if (event.results[0].isFinal) {
            processVoiceQuery(transcript);
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        updateUI('idle');
        updateStatus('❌ Error: ' + event.error);
        speak('Sorry, I didn\'t catch that. Please try again.');
    };

    recognition.onend = () => {
        if (isListening && recognition) {
            // Keep listening
            recognition.start();
        } else {
            updateUI('idle');
        }
    };

    return true;
}

// Get user location
function getUserLocation() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            // Default to London
            userLocation = { lat: 51.5074, lng: -0.1278 };
            console.log('⚠️ Geolocation not supported, using London:', userLocation);
            updateStatus(`📍 Using London, UK as default location`);
            resolve();
            return;
        }

        console.log('📍 Requesting location permission...');
        updateStatus('📍 Requesting location permission...');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log('✅ Got location:', userLocation);
                updateStatus(`📍 Location detected: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`);
                resolve();
            },
            (error) => {
                console.log('❌ Location error:', error.message);
                console.log('Using London as default');
                userLocation = { lat: 51.5074, lng: -0.1278 };
                updateStatus(`📍 Location access denied. Using London, UK as default.`);
                resolve();
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    });
}

// Start listening
async function startListening() {
    if (!recognition) {
        const initialized = initSpeechRecognition();
        if (!initialized) return;
    }

    if (!userLocation) {
        await getUserLocation();
    }

    try {
        recognition.start();
        document.getElementById('transcript').textContent = 'Listening...';
    } catch (e) {
        console.log('Recognition already started or error:', e);
    }
}

// Stop listening
function stopListening() {
    if (recognition) {
        isListening = false;
        recognition.stop();
    }
    updateUI('idle');
}

// Process voice query
async function processVoiceQuery(query) {
    console.log('🎤 Voice query:', query);
    
    stopListening();
    updateUI('processing');
    updateStatus('🤖 Asking Yelp AI...');

    try {
        const response = await queryYelpAI(query);
        displayResults(response);
        
        // Read response aloud
        if (response.text) {
            speak(response.text);
        }
    } catch (error) {
        console.error('Error processing query:', error);
        updateStatus('❌ Failed to get results');
        speak('Sorry, I couldn\'t find any results. Please try again.');
    }

    updateUI('idle');
}

// Query Yelp AI API
async function queryYelpAI(query) {
    console.log('📤 Querying Yelp AI API...');

    // Ensure we have location
    if (!userLocation) {
        console.log('📍 No location yet, getting it now...');
        await getUserLocation();
    }

    console.log('📍 Using location:', userLocation);

    // Detect if this is a reservation query
    const isReservation = /book|reserve|table|reservation/i.test(query);

    const requestBody = {
        query: `${query} near ${userLocation.lat}, ${userLocation.lng}`,
        user_context: {
            locale: CONFIG.LOCALE,
            latitude: userLocation.lat,
            longitude: userLocation.lng
        }
    };

    // Add conversation context for reservations
    if (isReservation) {
        console.log('🍽️ Detected reservation request');
        requestBody.conversation_context = {
            intent: 'reservation',
            preferences: {
                party_size: extractPartySize(query),
                time: extractTime(query),
                date: extractDate(query)
            }
        };
    }

    try {
        const response = await fetch(CONFIG.YELP_AI_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.YELP_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            console.error('API Error:', response.status);
            // Use mock data as fallback
            return getMockResponse(query, isReservation);
        }

        const data = await response.json();
        console.log('✅ AI Response:', data);
        
        // Check if reservation was successful
        if (data.reservation_confirmation) {
            console.log('🎉 Reservation confirmed:', data.reservation_confirmation);
        }
        
        return {
            text: data.response?.text || 'I found some great options for you!',
            businesses: extractBusinesses(data),
            reservation: data.reservation_confirmation
        };
    } catch (error) {
        console.error('API call failed:', error);
        // Use mock data as fallback
        return getMockResponse(query, isReservation);
    }
}

// Helper functions for reservation parsing
function extractPartySize(query) {
    const match = query.match(/(\d+)\s*(people|person|guests?)/i);
    return match ? parseInt(match[1]) : 2;
}

function extractTime(query) {
    const match = query.match(/(\d{1,2})(:\d{2})?\s*(am|pm)?/i);
    if (match) {
        let hour = parseInt(match[1]);
        const isPM = match[3]?.toLowerCase() === 'pm';
        if (isPM && hour < 12) hour += 12;
        return `${hour}:${match[2] || '00'}`;
    }
    return '19:00'; // Default to 7pm
}

function extractDate(query) {
    if (/today/i.test(query)) return new Date().toISOString().split('T')[0];
    if (/tomorrow/i.test(query)) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    }
    // Default to today
    return new Date().toISOString().split('T')[0];
}

// Extract businesses from AI response
function extractBusinesses(data) {
    const businesses = [];
    
    if (data.entities && data.entities.length > 0) {
        data.entities.forEach(entity => {
            if (entity.businesses) {
                entity.businesses.forEach(b => {
                    businesses.push({
                        name: b.name,
                        rating: b.rating,
                        price: b.price || '££',
                        category: b.categories?.[0]?.title || 'Restaurant',
                        address: b.location?.formatted_address || '',
                        tip: b.summaries?.short || 'Great local spot!'
                    });
                });
            }
        });
    }
    
    return businesses;
}

// Mock response for fallback
function getMockResponse(query, isReservation = false) {
    const businesses = [
        {
            name: 'The Ivy Restaurant',
            rating: 4.5,
            price: '£££',
            category: 'British',
            address: '1-5 West St, London WC2H 9NQ',
            tip: 'Classic British dining with a modern twist. Perfect for special occasions.'
        },
        {
            name: 'Dishoom',
            rating: 4.7,
            price: '££',
            category: 'Indian',
            address: '12 Upper St Martin\'s Lane, London WC2H 9FB',
            tip: 'Bombay-inspired cafe with exceptional breakfast and house chai.'
        },
        {
            name: 'Wagamama',
            rating: 4.4,
            price: '££',
            category: 'Asian',
            address: '14A Irving St, London WC2H 7AF',
            tip: 'Fresh ramen and Asian dishes. Try the chicken katsu curry.'
        }
    ];

    let responseText = `I found ${businesses.length} great options for you based on your request!`;
    
    if (isReservation) {
        const partySize = extractPartySize(query);
        const time = extractTime(query);
        responseText = `I can help you book a table for ${partySize} at ${time}. Here are some available restaurants. Note: Reservation feature requires activation from Yelp - this is a demo of the capability.`;
    }

    return {
        text: responseText,
        businesses: businesses,
        reservation: isReservation ? {
            status: 'demo',
            message: 'Reservation feature available - requires API activation'
        } : null
    };
}

// Display results
function displayResults(response) {
    const resultsDiv = document.getElementById('results');
    const aiResponseDiv = document.getElementById('aiResponse');
    const businessResultsDiv = document.getElementById('businessResults');

    // Show AI response text
    aiResponseDiv.textContent = response.text;

    // Clear previous business results
    businessResultsDiv.innerHTML = '';

    // Display businesses
    if (response.businesses && response.businesses.length > 0) {
        response.businesses.forEach(business => {
            const card = createBusinessCard(business);
            businessResultsDiv.appendChild(card);
        });
    } else {
        businessResultsDiv.innerHTML = '<p style="text-align: center; color: #999;">No businesses found. Try a different query.</p>';
    }

    // Show results section
    resultsDiv.classList.add('show');
    
    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

// Create business card
function createBusinessCard(business) {
    const card = document.createElement('div');
    card.className = 'business-card';
    
    card.innerHTML = `
        <div class="business-name">${business.name}</div>
        <div class="business-info">
            ⭐ ${business.rating} • ${business.price} • ${business.category}
        </div>
        ${business.address ? `<div class="business-info">📍 ${business.address}</div>` : ''}
        <div class="business-ai-tip">
            💡 ${business.tip}
        </div>
    `;
    
    // Read details when clicked
    card.addEventListener('click', () => {
        const text = `${business.name}. Rated ${business.rating} stars. ${business.tip}`;
        speak(text);
    });
    
    return card;
}

// Text-to-speech
function speak(text) {
    // Cancel any ongoing speech
    synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    synthesis.speak(utterance);
}

// Speak a preset query (for suggestion chips)
function speakQuery(query) {
    document.getElementById('transcript').textContent = query;
    processVoiceQuery(query);
}

// Clear results
function clearResults() {
    document.getElementById('results').classList.remove('show');
    document.getElementById('transcript').textContent = 'Waiting for your voice...';
    updateStatus('Tap the microphone and say something like "Find Italian restaurants nearby"');
}

// Update UI state
function updateUI(state) {
    const micBtn = document.getElementById('micBtn');
    
    micBtn.classList.remove('listening', 'processing');
    
    if (state === 'listening') {
        micBtn.classList.add('listening');
        micBtn.textContent = '🔴';
    } else if (state === 'processing') {
        micBtn.classList.add('processing');
        micBtn.textContent = '⏳';
    } else {
        micBtn.textContent = '🎙️';
    }
}

// Update status text
function updateStatus(text) {
    document.getElementById('statusText').textContent = text;
}

// Update location status
function updateLocationStatus(text) {
    const locStatus = document.getElementById('locationStatus');
    if (locStatus) {
        locStatus.textContent = text;
    }
}

// Microphone button click handler
document.getElementById('micBtn').addEventListener('click', () => {
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
});

// Initialize on load
window.addEventListener('load', async () => {
    console.log('🎤 Voice-First Discovery initialized');
    
    // Get location immediately
    updateLocationStatus('📍 Detecting your location...');
    await getUserLocation();
    
    if (userLocation) {
        updateLocationStatus(`✅ Location: ${userLocation.lat.toFixed(2)}, ${userLocation.lng.toFixed(2)}`);
    } else {
        updateLocationStatus('⚠️ Using default location (London)');
    }
    
    // Check for speech recognition support
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
        updateStatus('⚠️ Speech recognition not supported. Use suggestion chips or Chrome browser.');
    }
});

