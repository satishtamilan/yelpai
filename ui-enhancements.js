// Additional UI enhancements and polish

// Add smooth animations for AR markers
const ARAnimations = {
    // Fade in animation for new markers
    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.transform = 'translate(-50%, -50%) scale(0.8)';
        
        setTimeout(() => {
            element.style.transition = `all ${duration}ms ease-out`;
            element.style.opacity = '1';
            element.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 10);
    },
    
    // Pulse animation for selected marker
    pulse(element) {
        element.style.animation = 'pulse 0.5s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    },
    
    // Shake animation for errors
    shake(element) {
        element.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    },
};

// Add CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes pulse {
        0%, 100% { transform: translate(-50%, -50%) scale(1); }
        50% { transform: translate(-50%, -50%) scale(1.15); }
    }
    
    @keyframes shake {
        0%, 100% { transform: translate(-50%, -50%) translateX(0); }
        25% { transform: translate(-50%, -50%) translateX(-10px); }
        75% { transform: translate(-50%, -50%) translateX(10px); }
    }
    
    @keyframes slideInUp {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes slideInDown {
        from { transform: translateY(-100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    .business-card {
        animation: slideInUp 0.3s ease-out;
    }
    
    #top-bar {
        animation: slideInDown 0.3s ease-out;
    }
    
    .ar-marker {
        transition: all 0.2s ease-out;
    }
    
    .ar-marker:active {
        transform: translate(-50%, -50%) scale(0.95);
    }
    
    /* Distance-based opacity */
    .ar-marker[data-distance="far"] {
        opacity: 0.7;
        font-size: 11px;
    }
    
    .ar-marker[data-distance="medium"] {
        opacity: 0.85;
        font-size: 12px;
    }
    
    .ar-marker[data-distance="near"] {
        opacity: 1;
        font-size: 13px;
        font-weight: bold;
    }
    
    /* Haptic feedback simulation */
    @media (hover: hover) {
        .control-btn:active,
        .business-card:active,
        .ar-marker:active {
            transform: scale(0.95);
        }
    }
    
    /* Loading shimmer effect */
    @keyframes shimmer {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
    }
    
    .loading-shimmer {
        animation: shimmer 2s infinite linear;
        background: linear-gradient(
            to right,
            #f0f0f0 0%,
            #f8f8f8 20%,
            #f0f0f0 40%,
            #f0f0f0 100%
        );
        background-size: 1000px 100%;
    }
    
    /* Smooth scroll */
    #business-list {
        scroll-behavior: smooth;
    }
    
    /* Custom scrollbar */
    #business-list::-webkit-scrollbar {
        width: 6px;
    }
    
    #business-list::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
    }
    
    #business-list::-webkit-scrollbar-thumb {
        background: #d32323;
        border-radius: 3px;
    }
    
    #business-list::-webkit-scrollbar-thumb:hover {
        background: #b01d1d;
    }
    
    /* Tooltip styles */
    .tooltip {
        position: absolute;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        pointer-events: none;
        z-index: 10000;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.2s;
    }
    
    .tooltip.show {
        opacity: 1;
    }
    
    /* Rating stars */
    .rating-stars {
        display: inline-block;
        color: #ffa500;
    }
    
    /* Category pills */
    .category-pill {
        display: inline-block;
        background: #f0f0f0;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 11px;
        margin: 4px 4px 4px 0;
        color: #666;
    }
    
    /* Enhanced AI tip styling */
    .business-ai-tip {
        position: relative;
        padding-left: 30px;
    }
    
    .business-ai-tip::before {
        content: '💡';
        position: absolute;
        left: 8px;
        font-size: 16px;
    }
    
    /* Success message animation */
    @keyframes successPulse {
        0%, 100% { background: #d4edda; }
        50% { background: #c3e6cb; }
    }
    
    .success-message {
        animation: successPulse 1s ease-in-out;
    }
`;
document.head.appendChild(styleSheet);

// Utility functions for enhanced UX
const UXEnhancements = {
    // Haptic feedback (vibration)
    hapticFeedback(pattern = 10) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    },
    
    // Show tooltip
    showTooltip(element, text, duration = 2000) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip show';
        tooltip.textContent = text;
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
        
        setTimeout(() => {
            tooltip.classList.remove('show');
            setTimeout(() => tooltip.remove(), 200);
        }, duration);
    },
    
    // Format rating with stars
    formatRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '⭐'.repeat(fullStars);
        if (hasHalfStar) stars += '½';
        return `${stars} ${rating}`;
    },
    
    // Show loading skeleton
    showLoadingSkeleton(container) {
        container.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'business-card loading-shimmer';
            skeleton.style.height = '120px';
            container.appendChild(skeleton);
        }
    },
    
    // Smooth scroll to element
    smoothScrollTo(element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
        });
    },
};

// Export for use in app.js
if (typeof window !== 'undefined') {
    window.ARAnimations = ARAnimations;
    window.UXEnhancements = UXEnhancements;
}

