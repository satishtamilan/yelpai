// Yelp AI API Integration Module
// Uses the NEW Yelp AI API with conversational intelligence

const YelpAI = {
    apiKey: '', // Set from CONFIG
    baseUrl: 'https://api.yelp.com',
    chatId: null, // For multi-turn conversations
    
    // Initialize with API key
    init(apiKey) {
        this.apiKey = apiKey;
    },
    
    // NEW: Use Yelp AI API for conversational search
    async searchBusinessesWithAI(latitude, longitude, radius = 1000, limit = 20) {
        console.log('🔍 searchBusinessesWithAI called with:', { latitude, longitude, radius, limit });
        
        try {
            // Build natural language query based on location
            const query = `Find the top ${limit} businesses near me within ${radius} meters`;
            
            const requestBody = {
                query: query,
                user_context: {
                    locale: window.CONFIG?.LOCALE || 'en_GB', // Use GB for UK
                    latitude: latitude,
                    longitude: longitude
                }
            };
            
            // Add chat_id if this is a follow-up request
            if (this.chatId) {
                requestBody.chat_id = this.chatId;
            }
            
            console.log('📤 Sending request to Yelp AI API:', this.baseUrl + '/ai/chat/v2');
            console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));
            
            const response = await fetch(`${this.baseUrl}/ai/chat/v2`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            
            console.log('📥 Response status:', response.status, response.statusText);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error Response:', errorText);
                throw new Error(`Yelp AI API error: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            console.log('✅ AI API Response received:', data);
            
            // Store chat_id for follow-up conversations
            if (data.chat_id) {
                this.chatId = data.chat_id;
                console.log('💬 Chat ID stored:', this.chatId);
            }
            
            // Extract businesses from AI response
            const businesses = this.formatAIResponse(data);
            console.log('📊 Formatted', businesses.length, 'businesses from AI response');
            return businesses;
        } catch (error) {
            console.error('❌ searchBusinessesWithAI failed:', error);
            console.log('🔄 Attempting fallback to regular API...');
            // Fallback to regular API if AI API fails
            return this.searchBusinessesFallback(latitude, longitude, radius, limit);
        }
    },
    
    // Fallback to regular Fusion API
    async searchBusinessesFallback(latitude, longitude, radius = 1000, limit = 20) {
        try {
            const url = `${this.baseUrl}/v3/businesses/search?latitude=${latitude}&longitude=${longitude}&radius=${radius}&limit=${limit}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Accept': 'application/json',
                },
            });
            
            if (!response.ok) {
                throw new Error(`Yelp API error: ${response.status}`);
            }
            
            const data = await response.json();
            return this.formatBusinesses(data.businesses);
        } catch (error) {
            console.error('Failed to fetch from Yelp API:', error);
            throw error;
        }
    },
    
    // For compatibility - use AI search by default
    async searchBusinesses(latitude, longitude, radius = 1000, limit = 20) {
        return this.searchBusinessesWithAI(latitude, longitude, radius, limit);
    },
    
    // Format AI API response
    formatAIResponse(aiData) {
        const businesses = [];
        
        // Extract businesses from entities array
        if (aiData.entities && aiData.entities.length > 0) {
            aiData.entities.forEach(entity => {
                if (entity.businesses) {
                    entity.businesses.forEach(business => {
                        businesses.push({
                            id: business.id,
                            name: business.name,
                            rating: business.rating,
                            price: business.price || '$$',
                            categories: business.categories || [{ title: 'Restaurant' }],
                            coordinates: {
                                latitude: business.coordinates?.latitude,
                                longitude: business.coordinates?.longitude,
                            },
                            phone: business.phone,
                            url: business.url,
                            image_url: business.contextual_info?.photos?.[0]?.original_url,
                            review_count: business.review_count,
                            // Use AI-generated summaries!
                            ai_tip: business.summaries?.short || 
                                   business.contextual_info?.summary || 
                                   'Discover this local spot!',
                            ai_summary: aiData.response?.text || '',
                        });
                    });
                }
            });
        }
        
        return businesses;
    },
    
    // Get AI-generated recommendations for a business
    async getAIRecommendation(businessId) {
        // Note: This is a placeholder for Yelp's AI API
        // Update with actual AI endpoint when available
        try {
            // For now, generate based on reviews
            const url = `${this.baseUrl}/businesses/${businessId}/reviews`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Accept': 'application/json',
                },
            });
            
            if (!response.ok) {
                throw new Error(`Yelp API error: ${response.status}`);
            }
            
            const data = await response.json();
            return this.generateAITip(data.reviews);
        } catch (error) {
            console.error('Failed to get AI recommendation:', error);
            return 'Great local spot worth checking out!';
        }
    },
    
    // Format businesses to match app structure
    formatBusinesses(businesses) {
        return businesses.map(business => ({
            id: business.id,
            name: business.name,
            rating: business.rating,
            price: business.price || '$$',
            categories: business.categories || [{ title: 'Restaurant' }],
            coordinates: {
                latitude: business.coordinates.latitude,
                longitude: business.coordinates.longitude,
            },
            phone: business.phone,
            url: business.url,
            image_url: business.image_url,
            review_count: business.review_count,
            ai_tip: this.generateQuickTip(business),
        }));
    },
    
    // Generate a quick AI tip from business data
    generateQuickTip(business) {
        const tips = [];
        
        if (business.rating >= 4.5) {
            tips.push('Highly rated by locals');
        }
        
        if (business.review_count > 100) {
            tips.push('Popular spot with many reviews');
        }
        
        if (business.price === '$') {
            tips.push('Budget-friendly option');
        } else if (business.price === '$$$$') {
            tips.push('Upscale dining experience');
        }
        
        const category = business.categories[0]?.title || '';
        if (category.includes('Coffee')) {
            tips.push('Perfect for a coffee break');
        } else if (category.includes('Bar')) {
            tips.push('Great for evening drinks');
        }
        
        return tips.length > 0 
            ? tips.join('. ') + '.'
            : 'Discover something new at this local spot!';
    },
    
    // Generate AI tip from reviews
    generateAITip(reviews) {
        if (!reviews || reviews.length === 0) {
            return 'Discover this local gem!';
        }
        
        // Extract common themes from reviews
        const commonWords = this.extractKeywords(reviews);
        
        if (commonWords.includes('authentic')) {
            return 'Known for authentic flavors and traditional recipes.';
        }
        if (commonWords.includes('cozy') || commonWords.includes('atmosphere')) {
            return 'Great atmosphere perfect for a relaxing time.';
        }
        if (commonWords.includes('fresh')) {
            return 'Fresh ingredients and quality preparation.';
        }
        
        return 'Highly recommended by the community!';
    },
    
    // Extract keywords from reviews
    extractKeywords(reviews) {
        const allText = reviews.map(r => r.text.toLowerCase()).join(' ');
        const words = allText.split(/\s+/);
        
        const keywords = [
            'authentic', 'delicious', 'amazing', 'perfect',
            'fresh', 'cozy', 'atmosphere', 'friendly',
            'best', 'recommended', 'must-try'
        ];
        
        return keywords.filter(keyword => allText.includes(keyword));
    },
    
    // Make a reservation (if Yelp AI API supports it)
    async makeReservation(businessId, partySize, dateTime) {
        // Placeholder for reservation API
        console.log('Making reservation:', { businessId, partySize, dateTime });
        
        // This would call Yelp's AI reservation API
        // Return success/failure
        return {
            success: true,
            confirmationNumber: 'DEMO-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            message: 'Reservation confirmed!',
        };
    },
};

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = YelpAI;
}

