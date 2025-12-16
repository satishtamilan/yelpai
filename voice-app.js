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
        // Detect intent from voice command
        const intent = detectIntent(query);
        console.log('🎯 Detected intent:', intent);

        const response = await queryYelpAI(query);
        displayResults(response);
        
        // Handle different intents
        if (intent.type === 'booking' && response.businesses && response.businesses.length > 0) {
            // Check if AI says booking is not available
            const aiText = (response.text || '').toLowerCase();
            const bookingNotAvailable = /doesn't accept|don't accept|not accept|no reservation|can't book|cannot book/i.test(aiText);
            
            if (bookingNotAvailable) {
                // Don't auto-open modal if booking isn't available
                speak(response.text + ` However, you can still try booking by clicking the "Book Table" button on any restaurant card.`);
            } else {
                // Auto-open booking modal for first result
                setTimeout(() => {
                    const firstBusiness = response.businesses[0];
                    speak(response.text + ` Opening booking for ${firstBusiness.name}. When ready, say your booking details like: tomorrow at 7pm for 4 people, name John Smith, phone 07123456789`);
                    setTimeout(() => {
                        openBookingModal(firstBusiness.name, true); // true = auto-start voice
                    }, 3000);
                }, 2000);
            }
        } else if (intent.type === 'directions' && response.businesses && response.businesses.length > 0) {
            // Auto-open directions for first result
            setTimeout(() => {
                const firstBusiness = response.businesses[0];
                speak(response.text + ` Opening directions to ${firstBusiness.name}.`);
                setTimeout(() => {
                    getDirections(firstBusiness.address);
                }, 2000);
            }, 2000);
        } else if (intent.type === 'call' && response.businesses && response.businesses.length > 0) {
            // Show call info for first result
            setTimeout(() => {
                const firstBusiness = response.businesses[0];
                speak(response.text + ` Here's the phone number for ${firstBusiness.name}.`);
                setTimeout(() => {
                    callBusiness(firstBusiness.name, firstBusiness.phone);
                }, 2000);
            }, 2000);
        } else {
            // Normal search - just read response
            if (response.text) {
                speak(response.text);
            }
        }
    } catch (error) {
        console.error('Error processing query:', error);
        updateStatus('❌ Failed to get results');
        speak('Sorry, I couldn\'t find any results. Please try again.');
    }

    updateUI('idle');
}

// Detect intent from voice query
function detectIntent(query) {
    const lowerQuery = query.toLowerCase();
    
    // Booking intent
    if (/book|reserve|reservation|table for|make a booking/i.test(lowerQuery)) {
        return { type: 'booking', query };
    }
    
    // Directions intent
    if (/directions|navigate|how do i get|route to|take me to|drive to/i.test(lowerQuery)) {
        return { type: 'directions', query };
    }
    
    // Call intent
    if (/call|phone|contact|number for/i.test(lowerQuery)) {
        return { type: 'call', query };
    }
    
    // Default search intent
    return { type: 'search', query };
}

// Query Yelp AI API
async function queryYelpAI(query) {
    console.log('📤 Querying Yelp AI API...');

    // Ensure we have location
    if (!userLocation) {
        console.log('📍 No location yet, getting it now...');
        await getUserLocation();
    }

    // Check if user specified a location in their query
    // First, check if query has "near me", "nearby", "around here" - these should use GPS
    const useGPSPhrases = /\b(near me|nearby|near here|around here|close by|around me)\b/i;
    const shouldUseGPS = useGPSPhrases.test(query);
    
    // Check if user specified an actual city/location (requires capitalized words)
    const locationKeywords = /\b(in|at|near|around|close to|by)\s+([A-Z][a-z]+(\s+[A-Z][a-z]+)*)/;  // NO 'i' flag - case sensitive
    const hasCityName = /New York|London|Paris|Tokyo|Los Angeles|San Francisco|Chicago|Boston|Seattle|Miami|Vegas|Toronto|Vancouver|Sydney|Melbourne|Dublin|Manchester|Edinburgh|Birmingham|Amsterdam|Berlin|Madrid|Rome|Barcelona/i.test(query);
    
    const hasLocationInQuery = !shouldUseGPS && (locationKeywords.test(query) || hasCityName);

    let finalQuery = query;
    let context = {
        locale: CONFIG.LOCALE
    };

    if (hasLocationInQuery) {
        // User specified a location - let Yelp AI parse it naturally
        console.log('📍 Location detected in query, using natural language:', query);
        finalQuery = query;
    } else {
        // No location mentioned or "near me" - use GPS coordinates
        console.log('📍 No specific location in query (or "near me"), using GPS:', userLocation);
        finalQuery = `${query} near ${userLocation.lat}, ${userLocation.lng}`;
        context.latitude = userLocation.lat;
        context.longitude = userLocation.lng;
    }

    // Detect if this is a reservation query
    const isReservation = /book|reserve|table|reservation/i.test(query);

    const requestBody = {
        query: finalQuery,
        user_context: context
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
                        tip: b.summaries?.short || 'Great local spot!',
                        review_count: b.review_count || 0,
                        image_url: b.contextual_info?.photos?.[0]?.original_url || b.image_url || '',
                        phone: b.phone || ''
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
            tip: 'Classic British dining with a modern twist. Perfect for special occasions.',
            review_count: 1245,
            image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
            phone: '+44 20 7836 4751'
        },
        {
            name: 'Dishoom',
            rating: 4.7,
            price: '££',
            category: 'Indian',
            address: '12 Upper St Martin\'s Lane, London WC2H 9FB',
            tip: 'Bombay-inspired cafe with exceptional breakfast and house chai.',
            review_count: 2156,
            image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
            phone: '+44 20 7420 9320'
        },
        {
            name: 'Wagamama',
            rating: 4.4,
            price: '££',
            category: 'Asian',
            address: '14A Irving St, London WC2H 7AF',
            tip: 'Fresh ramen and Asian dishes. Try the chicken katsu curry.',
            review_count: 987,
            image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
            phone: '+44 20 7839 2323'
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

    // Store businesses globally for voice commands
    window.currentBusinesses = response.businesses || [];

    // Display businesses
    if (response.businesses && response.businesses.length > 0) {
        response.businesses.forEach((business, index) => {
            const card = createBusinessCard(business, index);
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
function createBusinessCard(business, index) {
    const card = document.createElement('div');
    card.className = 'business-card';
    card.dataset.index = index;
    
    const safeAddress = (business.address || '').replace(/'/g, "\\'");
    const safeName = business.name.replace(/'/g, "\\'");
    
    card.innerHTML = `
        ${business.image_url ? `<img src="${business.image_url}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 10px; margin-bottom: 15px;" alt="${business.name}">` : ''}
        <div class="business-name">${business.name}</div>
        <div class="business-info">
            ⭐ ${business.rating} ${business.review_count ? `(${business.review_count} reviews)` : ''} • ${business.price} • ${business.category}
        </div>
        ${business.address ? `<div class="business-info">📍 ${business.address}</div>` : '<div class="business-info" style="color: #999;">📍 Address not available</div>'}
        <div class="business-ai-tip">
            💡 ${business.tip}
        </div>
        <div class="business-actions" id="actions-${index}">
            <button class="action-btn book-btn" data-action="book">
                📅 Book Table
            </button>
            <button class="action-btn directions-btn" data-action="directions" ${!business.address ? 'disabled' : ''}>
                🗺️ Directions
            </button>
            <button class="action-btn call-btn" data-action="call">
                📞 Call
            </button>
        </div>
    `;
    
    // Add event listeners to buttons (better than inline onclick)
    setTimeout(() => {
        const actionsDiv = document.getElementById(`actions-${index}`);
        if (actionsDiv) {
            const bookBtn = actionsDiv.querySelector('[data-action="book"]');
            const directionsBtn = actionsDiv.querySelector('[data-action="directions"]');
            const callBtn = actionsDiv.querySelector('[data-action="call"]');
            
            if (bookBtn) {
                bookBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    openBookingModal(business.name);
                });
            }
            
            if (directionsBtn && !directionsBtn.disabled) {
                directionsBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    getDirections(business.address);
                });
            }
            
            if (callBtn) {
                callBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    callBusiness(business.name, business.phone);
                });
            }
        }
    }, 0);
    
    // Read details when clicked on card (not buttons)
    card.addEventListener('click', (e) => {
        // Only speak if clicking on the card itself, not buttons
        if (!e.target.closest('.business-actions')) {
            const text = `${business.name}. Rated ${business.rating} stars. ${business.tip}`;
            speak(text);
        }
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

// Open booking modal
function openBookingModal(businessName, autoStartVoice = false) {
    const modal = document.getElementById('bookingModal');
    document.getElementById('modalBusinessName').textContent = businessName;
    
    // Store business name for later
    window.currentBookingBusiness = businessName;
    
    modal.style.display = 'flex';
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bookingDate').value = today;
    document.getElementById('bookingDate').min = today;
    
    // If opened from voice command, auto-start voice input after a delay
    if (autoStartVoice) {
        const voiceStatus = document.getElementById('voiceBookingStatus');
        const voiceBtn = document.getElementById('voiceBookingBtn');
        let countdown = 4;
        
        // Store countdown interval so it can be cancelled
        window.bookingCountdownInterval = null;
        
        // Give clear instruction first
        speak(`Ready to book at ${businessName}. Starting voice input in 4 seconds. Or click to fill manually.`);
        
        // Allow cancelling countdown by clicking button
        voiceBtn.textContent = '❌ Cancel Auto-Voice (Fill Manually)';
        voiceBtn.style.background = 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)';
        voiceBtn.onclick = () => {
            if (window.bookingCountdownInterval) {
                clearInterval(window.bookingCountdownInterval);
                window.bookingCountdownInterval = null;
                voiceBtn.textContent = '🎤 Use Voice to Fill Form';
                voiceBtn.style.background = 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)';
                voiceBtn.onclick = startVoiceBooking;
                voiceStatus.textContent = '💡 Countdown cancelled. Fill form manually or click "Use Voice" above.';
                voiceStatus.style.color = '#4CAF50';
                voiceStatus.style.fontSize = '14px';
                voiceStatus.style.fontWeight = 'normal';
                speak('Auto-voice cancelled. Fill the form manually.');
            }
        };
        
        window.bookingCountdownInterval = setInterval(() => {
            if (countdown > 0) {
                voiceStatus.textContent = `🎤 Voice will start in ${countdown}... Get ready! (Click button above to cancel)`;
                voiceStatus.style.color = '#ffa500';
                voiceStatus.style.fontSize = '18px';
                voiceStatus.style.fontWeight = 'bold';
                countdown--;
            } else {
                clearInterval(window.bookingCountdownInterval);
                window.bookingCountdownInterval = null;
                
                // Reset button for voice input
                voiceBtn.textContent = '🎤 Use Voice to Fill Form';
                voiceBtn.onclick = startVoiceBooking;
                
                startVoiceBooking();
            }
        }, 1000);
    } else {
        speak(`Let's book a table at ${businessName}. You can use voice to fill the form. Click "Use Voice" or fill manually.`);
    }
}

// Voice booking input
let bookingRecognition = null;
let bookingIsListening = false;
let bookingTranscript = '';

function startVoiceBooking() {
    if (bookingIsListening) {
        stopVoiceBooking();
        return;
    }
    
    if (!recognition) {
        initSpeechRecognition();
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert('Voice input not supported in this browser');
        return;
    }
    
    bookingRecognition = new SpeechRecognition();
    bookingRecognition.continuous = true; // Changed to continuous!
    bookingRecognition.interimResults = true;
    bookingRecognition.lang = 'en-GB';
    
    const voiceBtn = document.getElementById('voiceBookingBtn');
    const voiceStatus = document.getElementById('voiceBookingStatus');
    
    bookingIsListening = true;
    bookingTranscript = '';
    
    voiceBtn.textContent = '⏹️ Stop Listening';
    voiceBtn.style.background = 'linear-gradient(135deg, #ff1744 0%, #ff4444 100%)';
    voiceBtn.style.animation = 'pulse 1.5s infinite';
    voiceStatus.innerHTML = '🎧 <strong>Listening...</strong><br><span style="font-size: 12px;">Speak clearly: "tomorrow at 7pm for 4 people, name John, phone 07123..."</span>';
    voiceStatus.style.color = '#0f0';
    voiceStatus.style.fontSize = '14px';
    voiceStatus.style.fontWeight = 'bold';
    
    bookingRecognition.onresult = (event) => {
        // Get all results
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            const confidence = event.results[i][0].confidence;
            
            console.log(`Speech result: "${transcript}" (confidence: ${confidence})`);
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }
        
        // Update accumulated transcript
        if (finalTranscript) {
            bookingTranscript += finalTranscript;
            console.log('Accumulated transcript:', bookingTranscript);
        }
        
        // Show current transcript (final + interim)
        const displayTranscript = bookingTranscript + interimTranscript;
        voiceStatus.innerHTML = `🎤 <strong>"${displayTranscript}"</strong><br><span style="font-size: 12px; color: #aaa;">Keep speaking or click "Stop" when done</span>`;
        voiceStatus.style.color = '#0f0';
    };
    
    bookingRecognition.onerror = (event) => {
        console.error('Booking voice error:', event.error);
        
        // Don't stop on 'no-speech' error, just restart
        if (event.error === 'no-speech') {
            console.log('No speech detected, continuing to listen...');
            voiceStatus.textContent = '🎧 Still listening... Keep speaking!';
            return;
        }
        
        // For other errors, stop
        voiceBtn.textContent = '🎤 Use Voice to Fill Form';
        voiceBtn.style.background = 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)';
        voiceStatus.textContent = `❌ Error: ${event.error}. Try again or fill manually.`;
        voiceStatus.style.color = '#ff4444';
        bookingIsListening = false;
    };
    
    bookingRecognition.onend = () => {
        if (bookingIsListening) {
            // Restart if we're still supposed to be listening
            try {
                bookingRecognition.start();
            } catch (e) {
                console.log('Could not restart:', e);
                stopVoiceBooking();
            }
        } else {
            voiceBtn.textContent = '🎤 Use Voice to Fill Form';
            voiceBtn.style.background = 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)';
        }
    };
    
    try {
        bookingRecognition.start();
        speak('I\'m listening. Speak your booking details now.');
    } catch (e) {
        console.error('Failed to start:', e);
        voiceStatus.textContent = '❌ Failed to start. Try again.';
        bookingIsListening = false;
    }
}

function closeVoiceHelp() {
    // Just close/minimize the voice help section
    const voiceStatus = document.getElementById('voiceBookingStatus');
    voiceStatus.style.minHeight = '30px';
}

function stopVoiceBooking() {
    bookingIsListening = false;
    
    if (bookingRecognition) {
        try {
            bookingRecognition.stop();
        } catch (e) {
            console.log('Already stopped');
        }
    }
    
    const voiceBtn = document.getElementById('voiceBookingBtn');
    const voiceStatus = document.getElementById('voiceBookingStatus');
    
    voiceBtn.textContent = '🔄 Try Voice Again';
    voiceBtn.style.background = 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)';
    
    // Parse the accumulated transcript
    if (bookingTranscript.trim()) {
        console.log('Final transcript to parse:', bookingTranscript);
        voiceStatus.innerHTML = `⏳ Processing: "${bookingTranscript}"...`;
        voiceStatus.style.color = '#ffa500';
        
        setTimeout(() => {
            parseBookingDetails(bookingTranscript);
            
            // Reset button
            voiceBtn.textContent = '🎤 Use Voice Again';
            voiceBtn.style.background = 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)';
        }, 500);
    } else {
        voiceStatus.innerHTML = '⚠️ No speech detected. <strong>Try again</strong> or fill manually.';
        voiceStatus.style.color = '#ffa500';
        voiceStatus.style.fontSize = '14px';
        voiceStatus.style.fontWeight = 'normal';
        
        // Reset button for retry
        voiceBtn.textContent = '🔄 Try Voice Again';
        voiceBtn.style.background = 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)';
    }
}

// Parse booking details from voice
function parseBookingDetails(transcript) {
    const voiceStatus = document.getElementById('voiceBookingStatus');
    const lower = transcript.toLowerCase();
    
    console.log('🎤 Parsing booking:', transcript);
    console.log('🔍 Lowercase:', lower);
    
    // Reset border colors
    document.getElementById('bookingDate').style.borderColor = '';
    document.getElementById('bookingTime').style.borderColor = '';
    document.getElementById('partySize').style.borderColor = '';
    document.getElementById('customerName').style.borderColor = '';
    document.getElementById('customerPhone').style.borderColor = '';
    
    // Parse date
    let date = new Date();
    let dateDetected = false;
    
    if (/tomorrow/i.test(lower)) {
        date.setDate(date.getDate() + 1);
        document.getElementById('bookingDate').value = date.toISOString().split('T')[0];
        voiceStatus.textContent = '✅ Date: Tomorrow';
        dateDetected = true;
        console.log('✅ Date: Tomorrow');
    } else if (/today/i.test(lower)) {
        document.getElementById('bookingDate').value = date.toISOString().split('T')[0];
        voiceStatus.textContent = '✅ Date: Today';
        dateDetected = true;
        console.log('✅ Date: Today');
    } else if (/(\w+day)\s+(\d{1,2})/i.test(lower)) {
        // Handle "Friday 20th" etc
        const match = lower.match(/(\w+day)\s+(\d{1,2})/i);
        voiceStatus.textContent = `✅ Date detected: ${match[0]}`;
        document.getElementById('bookingDate').value = date.toISOString().split('T')[0];
        dateDetected = true;
        console.log('✅ Date:', match[0]);
    } else {
        // Default to today if no date mentioned
        document.getElementById('bookingDate').value = date.toISOString().split('T')[0];
        console.log('⚠️ No date detected, using today as default');
    }
    
    // Parse time (improved!)
    const timePatterns = [
        /(\d{1,2})\s*(pm|p\.m\.|p m|in the evening)/i,
        /(\d{1,2})\s*(am|a\.m\.|a m|in the morning)/i,
        /(\d{1,2}):(\d{2})\s*(pm|am|p\.m\.|a\.m\.)?/i,
        /(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s*(pm|am|p\.m\.|a\.m\.|o'clock)?/i,
    ];
    
    // Word to hour mapping
    const timeWords = {
        'one': 13, 'two': 14, 'three': 15, 'four': 16,
        'five': 17, 'six': 18, 'seven': 19, 'eight': 20,
        'nine': 21, 'ten': 22, 'eleven': 23, 'twelve': 12
    };
    
    let timeDetected = false;
    for (const pattern of timePatterns) {
        const match = lower.match(pattern);
        if (match) {
            console.log('⏰ Time match:', match);
            let hour = 19; // default 7pm
            
            if (match[1] && !isNaN(match[1])) {
                // It's a digit
                hour = parseInt(match[1]);
                console.log('  - Digit hour:', hour);
                // Assume PM for dinner times if not specified
                if (hour >= 5 && hour <= 11 && !match[2]) {
                    hour += 12;
                    console.log('  - Assumed PM, hour now:', hour);
                } else if (match[2] && match[2].toLowerCase().includes('pm') && hour < 12) {
                    hour += 12;
                    console.log('  - Explicit PM, hour now:', hour);
                } else if (match[2] && match[2].toLowerCase().includes('am') && hour === 12) {
                    hour = 0;
                }
            } else if (match[1] && timeWords[match[1]]) {
                // It's a word number
                hour = timeWords[match[1]];
                console.log('  - Word hour:', match[1], '=', hour);
            }
            
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            document.getElementById('bookingTime').value = timeStr;
            voiceStatus.textContent += ` | Time: ${timeStr}`;
            timeDetected = true;
            console.log('✅ Time set to:', timeStr);
            break;
        }
    }
    if (!timeDetected) {
        console.log('⚠️ No time detected');
    }
    
    // Parse party size (including word numbers!)
    const partySizePatterns = [
        /for\s+(one|two|three|four|five|six|seven|eight|1|2|3|4|5|6|7|8)\s+(people|person|guests?)/i,
        /(one|two|three|four|five|six|seven|eight|1|2|3|4|5|6|7|8)\s+(people|person|guests?)/i,
        /party\s+of\s+(one|two|three|four|five|six|seven|eight|1|2|3|4|5|6|7|8)/i,
        /table\s+for\s+(one|two|three|four|five|six|seven|eight|1|2|3|4|5|6|7|8)/i,
        /for\s+(one|two|three|four|five|six|seven|eight|1|2|3|4|5|6|7|8)/i,
    ];
    
    // Convert word numbers to digits
    const wordToNumber = {
        'one': '1', 'two': '2', 'three': '3', 'four': '4',
        'five': '5', 'six': '6', 'seven': '7', 'eight': '8'
    };
    
    let partySizeDetected = false;
    for (const pattern of partySizePatterns) {
        const match = lower.match(pattern);
        if (match) {
            console.log('👥 Party size match:', match);
            let size = match[1];
            console.log('  - Raw size:', size);
            // Convert word to number if needed
            if (wordToNumber[size]) {
                size = wordToNumber[size];
                console.log('  - Converted to:', size);
            }
            document.getElementById('partySize').value = size;
            voiceStatus.textContent += ` | Party: ${size}`;
            partySizeDetected = true;
            console.log('✅ Party size set to:', size);
            break;
        }
    }
    if (!partySizeDetected) {
        console.log('⚠️ No party size detected');
    }
    
    // Parse name
    const namePatterns = [
        /name\s+is\s+([a-z\s]+?)(?:\s+phone|\s+number|\.|$)/i,
        /(?:I'm|I am)\s+([a-z\s]+?)(?:\s+phone|\s+number|\.|$)/i,
        /my\s+name\s+is\s+([a-z\s]+?)(?:\s+phone|\s+number|\.|$)/i
    ];
    
    for (const pattern of namePatterns) {
        const match = transcript.match(pattern);
        if (match && match[1]) {
            const name = match[1].trim();
            document.getElementById('customerName').value = name;
            voiceStatus.textContent += ` | Name: ${name}`;
            break;
        }
    }
    
    // Parse phone
    const phonePatterns = [
        /phone\s+(?:is\s+|number\s+)?(\d[\d\s]+)/i,
        /number\s+(?:is\s+)?(\d[\d\s]+)/i,
        /(07\d{3}\s?\d{6}|\+44\s?7\d{3}\s?\d{6})/i,
        /(\d{11})/i
    ];
    
    for (const pattern of phonePatterns) {
        const match = transcript.match(pattern);
        if (match && match[1]) {
            const phone = match[1].replace(/\s+/g, '');
            document.getElementById('customerPhone').value = phone;
            voiceStatus.textContent += ` | Phone: ${phone}`;
            break;
        }
    }
    
    // Provide feedback
    setTimeout(() => {
        const hasDate = document.getElementById('bookingDate').value;
        const hasTime = document.getElementById('bookingTime').value;
        const hasParty = document.getElementById('partySize').value;
        const hasName = document.getElementById('customerName').value;
        const hasPhone = document.getElementById('customerPhone').value;
        
        const allFilled = hasDate && hasTime && hasParty && hasName && hasPhone;
        const partialFilled = hasDate || hasTime || hasParty;
        
        if (allFilled) {
            speak('Perfect! All details captured. Please review and confirm your booking.');
            voiceStatus.textContent += ' | ✅ Ready to confirm!';
            voiceStatus.style.color = '#4CAF50';
        } else if (partialFilled) {
            let missingFields = [];
            if (!hasDate) missingFields.push('date');
            if (!hasTime) missingFields.push('time');
            if (!hasParty) missingFields.push('party size');
            if (!hasName) missingFields.push('name');
            if (!hasPhone) missingFields.push('phone');
            
            speak(`I captured some details. Please fill in: ${missingFields.join(', ')}`);
            voiceStatus.textContent += ` | ⚠️ Fill: ${missingFields.join(', ')}`;
            voiceStatus.style.color = '#ffa500';
            
            // Highlight missing fields
            if (!hasDate) document.getElementById('bookingDate').style.borderColor = '#ffa500';
            if (!hasTime) document.getElementById('bookingTime').style.borderColor = '#ffa500';
            if (!hasParty) document.getElementById('partySize').style.borderColor = '#ffa500';
            if (!hasName) document.getElementById('customerName').style.borderColor = '#ffa500';
            if (!hasPhone) document.getElementById('customerPhone').style.borderColor = '#ffa500';
        } else {
            speak('I couldn\'t detect booking details. Please try again or fill manually. Say something like: tomorrow at 7pm for 4 people, name John Smith, phone 07123456789');
            voiceStatus.textContent = '❌ No details detected. Try again or fill manually.';
            voiceStatus.style.color = '#ff4444';
        }
    }, 500);
}

// Close booking modal
function closeBookingModal() {
    document.getElementById('bookingModal').style.display = 'none';
    
    // Cancel countdown if active
    if (window.bookingCountdownInterval) {
        clearInterval(window.bookingCountdownInterval);
        window.bookingCountdownInterval = null;
    }
    
    // Stop any active booking voice recognition
    bookingIsListening = false;
    if (bookingRecognition) {
        try {
            bookingRecognition.stop();
        } catch (e) {
            console.log('Voice already stopped');
        }
        bookingRecognition = null;
    }
    
    // Reset voice button appearance
    const voiceBtn = document.getElementById('voiceBookingBtn');
    const voiceStatus = document.getElementById('voiceBookingStatus');
    if (voiceBtn) {
        voiceBtn.textContent = '🎤 Use Voice to Fill Form';
        voiceBtn.style.background = 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)';
        voiceBtn.onclick = startVoiceBooking;
    }
    if (voiceStatus) {
        voiceStatus.textContent = '💡 Continuous listening! Speak all details, then click "Stop Listening"';
        voiceStatus.style.color = '#4CAF50';
        voiceStatus.style.fontSize = '14px';
        voiceStatus.style.fontWeight = 'normal';
    }
}

// Confirm booking
function confirmBooking() {
    const businessName = document.getElementById('modalBusinessName').textContent;
    const date = document.getElementById('bookingDate').value;
    const time = document.getElementById('bookingTime').value;
    const partySize = document.getElementById('partySize').value;
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    
    if (!date || !time || !partySize || !name || !phone) {
        alert('Please fill in all fields');
        return;
    }
    
    // Format date nicely
    const dateObj = new Date(date + 'T' + time);
    const formattedDate = dateObj.toLocaleDateString('en-GB', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Generate confirmation number
    const confirmationNumber = 'YLP-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    // Show confirmation
    const confirmationMessage = `
        ✅ BOOKING CONFIRMED!
        
        Restaurant: ${businessName}
        Date: ${formattedDate}
        Time: ${time}
        Party Size: ${partySize} people
        Name: ${name}
        Phone: ${phone}
        
        Confirmation #: ${confirmationNumber}
        
        📧 A confirmation email has been sent to you.
        📱 You'll receive an SMS reminder 2 hours before your reservation.
    `;
    
    alert(confirmationMessage);
    speak(`Booking confirmed at ${businessName} for ${partySize} people on ${formattedDate} at ${time}. Your confirmation number is ${confirmationNumber}.`);
    
    closeBookingModal();
}

// Get directions
function getDirections(address) {
    if (!address || address.trim() === '') {
        speak('Sorry, no address available for this restaurant.');
        alert('❌ No address available\n\nThis restaurant doesn\'t have a full address in our data.');
        return;
    }
    
    console.log('📍 Getting directions to:', address);
    speak(`Opening directions to ${address}`);
    
    const encodedAddress = encodeURIComponent(address);
    let mapsUrl;
    
    if (userLocation) {
        // Open Google Maps with directions from current location
        mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${encodedAddress}`;
        console.log('🗺️ Maps URL with origin:', mapsUrl);
    } else {
        // Open Google Maps to the destination only
        mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
        console.log('🗺️ Maps URL (no origin):', mapsUrl);
    }
    
    // Try to open in new window
    const newWindow = window.open(mapsUrl, '_blank');
    
    // If popup was blocked, show fallback
    if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
        console.log('⚠️ Popup blocked, showing fallback');
        
        // Create a modal with the link
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
        `;
        
        modal.innerHTML = `
            <div style="background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%); padding: 30px; border-radius: 20px; max-width: 500px; text-align: center; border: 1px solid rgba(255,255,255,0.1);">
                <div style="font-size: 50px; margin-bottom: 15px;">🗺️</div>
                <h2 style="color: #ff4444; margin-bottom: 15px;">Get Directions</h2>
                <p style="color: #ddd; margin-bottom: 20px; line-height: 1.6;">
                    <strong>Address:</strong><br>
                    ${address}
                </p>
                <a href="${mapsUrl}" target="_blank" style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #4285F4 0%, #1976D2 100%); color: white; text-decoration: none; border-radius: 10px; font-weight: bold; margin: 10px; font-size: 16px;">
                    📍 Open Google Maps
                </a>
                <button onclick="this.parentElement.parentElement.remove()" style="display: inline-block; padding: 15px 30px; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 10px; font-weight: bold; margin: 10px; cursor: pointer; font-size: 16px;">
                    ❌ Close
                </button>
                <p style="color: #999; margin-top: 20px; font-size: 12px;">
                    💡 Tip: Allow popups for this site for faster access
                </p>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    } else {
        console.log('✅ Directions opened in new tab');
    }
}

// Call business
function callBusiness(businessName, phone) {
    if (phone) {
        speak(`The phone number for ${businessName} is ${phone}`);
        alert(`📞 ${businessName}\n\n${phone}\n\nClick OK to close, then dial this number on your phone.`);
    } else {
        speak(`Phone number not available for ${businessName}. Please search for them on Yelp.`);
        alert(`📞 ${businessName}\n\nPhone number not available.\n\nPlease visit their Yelp page or search online for contact information.`);
    }
}

// Voice command for booking
function voiceBooking() {
    speak('Please say the restaurant name you want to book');
    startListening();
}

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
    
    // Close modal when clicking outside
    window.onclick = (event) => {
        const modal = document.getElementById('bookingModal');
        if (event.target === modal) {
            closeBookingModal();
        }
    };
});

