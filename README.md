# Voice-First Business Discovery

🎤 **Voice-activated business search powered by Yelp AI API**

A hands-free, conversational app for discovering restaurants and local businesses using natural language voice commands. Perfect for drivers, multitaskers, and accessibility needs.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://your-app-url-here.com)
[![Yelp AI API](https://img.shields.io/badge/Yelp-AI%20API-red)](https://docs.developer.yelp.com/reference/v2_ai_chat)
[![Hackathon](https://img.shields.io/badge/Yelp-Hackathon%202025-orange)](https://yelp-ai.devpost.com/)

---

## 🎯 Overview

Voice-First Discovery revolutionizes local business search by combining:
- **🎙️ Voice Recognition** - Speak naturally, no typing
- **🤖 Yelp AI API** - Conversational intelligence
- **🔊 Text-to-Speech** - Hear results aloud
- **📍 GPS Integration** - Location-aware results
- **📱 Web-Based** - Works on any device, no app install

**Built for the Yelp AI API Hackathon 2025**

---

## ✨ Features

### Core Features
- **Voice-First Interface** - Tap microphone and speak naturally
- **Conversational AI** - Powered by Yelp's AI API (`/ai/chat/v2`)
- **Hands-Free Operation** - Perfect for driving or multitasking
- **Natural Language** - "Find vegan pizza near me" just works
- **Audio Feedback** - Results read aloud automatically
- **Location-Aware** - GPS-based recommendations

### Advanced Features
- **Reservation Support** - Framework ready for table bookings
- **Suggestion Chips** - Quick-tap common queries
- **Context Preservation** - Remembers conversation flow
- **Accessibility** - Screen reader friendly
- **Mobile Optimized** - Touch-friendly, responsive design

---

## 🚀 Live Demo

**Try it now:** [https://your-app-url-here.com](https://your-app-url-here.com)

**Try saying:**
- "Find Italian restaurants nearby"
- "Show me coffee shops"
- "What's the best pizza place around here?"
- "Book a table for 2 at 7pm"

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **APIs:** 
  - Yelp AI API (`/ai/chat/v2`) - Business data & AI
  - Web Speech API - Voice recognition
  - Speech Synthesis API - Text-to-speech
  - Geolocation API - GPS positioning
- **Hosting:** Firebase Hosting / Vercel
- **Version Control:** Git + GitHub

---

## 📁 Project Structure

```
voice-first-discovery/
├── voice-app.html          # Main application
├── voice-app.js            # Application logic
├── yelp-api.js             # Yelp API integration (legacy)
├── test-api.html           # API testing tool
├── firebase.json           # Firebase configuration
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

---

## 🎮 Usage

### On Desktop:
1. Open the app
2. Click microphone button
3. Allow microphone permission
4. Speak your query
5. View results

### On Mobile (Best Experience):
1. Open in mobile browser
2. Tap microphone
3. Allow camera & location permissions
4. Speak naturally
5. Tap any result to hear more

### Using Suggestions:
- Tap any suggestion chip for instant search
- No voice needed for testing

---

## 🔧 Local Development

### Prerequisites:
- Modern web browser (Chrome recommended)
- HTTPS or localhost (for camera/microphone)

### Run Locally:
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/voice-first-discovery.git
cd voice-first-discovery

# Start a local server
python3 -m http.server 8080

# Open in browser
open http://localhost:8080/voice-app.html
```

### Configuration:
1. Get Yelp API key from [Yelp Developers](https://www.yelp.com/developers)
2. Add to `voice-app.js`:
```javascript
const CONFIG = {
    YELP_API_KEY: 'your-api-key-here',
    LOCALE: 'en_GB', // or 'en_US'
};
```

---

## 🎯 Use Cases

### Primary Use Cases:
- 🚗 **Drivers** - Hands-free search while driving
- 🍳 **Cooking** - Find restaurants without messy fingers
- ♿ **Accessibility** - Helps visually impaired users
- 🏃 **Multitasking** - Search while busy with other tasks

### Example Scenarios:
- Driver looking for lunch on route
- Person with mobility issues browsing restaurants
- User comparing multiple options hands-free
- Quick restaurant search while packing

---

## 🏆 Hackathon Submission

### Innovation Points:
1. **Voice-First Approach** - Unique hands-free interface
2. **Safety Focus** - Reduces distracted driving
3. **Accessibility** - Inclusive design for all users
4. **Practical Value** - Solves real everyday problems
5. **AI Integration** - Full Yelp AI API implementation

### Technical Highlights:
- Real-time voice recognition
- Conversational AI responses
- Location-aware search
- Audio feedback system
- Cross-platform compatibility

---

## 🎥 Demo Video

**Watch the demo:** [YouTube Link](https://youtube.com/your-video)

**Video covers:**
- Problem statement
- Voice interface demo
- AI conversation flow
- Real-world usage
- Technical implementation

---

## 📊 API Integration

### Yelp AI API Usage:
```javascript
POST https://api.yelp.com/ai/chat/v2
{
  "query": "Find vegan restaurants near me",
  "user_context": {
    "locale": "en_GB",
    "latitude": 51.5074,
    "longitude": -0.1278
  }
}
```

### Features Used:
- ✅ Natural language queries
- ✅ Location context
- ✅ Conversational responses
- ✅ Business recommendations
- ✅ AI-generated insights

---

## 🔒 Security & Privacy

- API keys should be stored in environment variables for production
- Location data is only used for search, not stored
- Voice data is processed locally, not recorded
- All communication over HTTPS

---

## 🚧 Future Enhancements

- [ ] Real-time reservation booking
- [ ] Multi-turn conversation context
- [ ] Route-based restaurant search
- [ ] Car Mode UI (larger buttons)
- [ ] Offline mode with cached results
- [ ] Multi-language support
- [ ] Integration with navigation apps

---

## 📱 Browser Compatibility

| Browser | Voice Input | Text-to-Speech | GPS |
|---------|------------|----------------|-----|
| Chrome (Desktop) | ✅ | ✅ | ✅ |
| Chrome (Mobile) | ✅ | ✅ | ✅ |
| Safari (iOS) | ⚠️ Limited | ✅ | ✅ |
| Firefox | ⚠️ Limited | ✅ | ✅ |
| Edge | ✅ | ✅ | ✅ |

**Recommended:** Chrome or Edge for best experience

---

## 🤝 Contributing

This is a hackathon project, but contributions welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

MIT License - feel free to use and modify!

---

## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Hackathon: [Yelp AI API Hackathon 2025](https://yelp-ai.devpost.com/)

---

## 🙏 Acknowledgments

- Yelp for the amazing AI API
- Web Speech API for voice capabilities
- The open-source community

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/YOUR_USERNAME/voice-first-discovery/issues)
- **Email:** your.email@example.com
- **Hackathon:** Submit questions via Devpost

---

**Built with ❤️ for the Yelp AI API Hackathon 2025**

**Deadline:** December 17, 2025 @ 5:00pm EST
