import { useState, useEffect } from 'react';
import { smoothScrollToWithHighlight, getVisibleSection, scrollToTop, onScroll } from '../../utils/smoothScroll';
import './GlassNav.css';

export default function GlassNav() {
    const [activeSection, setActiveSection] = useState('position-size');
    const [isScrolled, setIsScrolled] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);

    const navItems = [
        {
            id: 'position-size',
            label: 'Position Size',
            icon: '📊',
            description: 'Calculate optimal position sizing'
        },
        {
            id: 'risk-reward',
            label: 'Risk/Reward',
            icon: '⚖️',
            description: 'Analyze risk-reward ratios'
        },
        {
            id: 'mtf-checklist',
            label: 'MTF Checklist',
            icon: '✓',
            description: 'Multi-timeframe analysis'
        }
    ];

    const sectionIds = navItems.map(item => item.id);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);

            // Detect which section is most visible using improved algorithm
            const visibleSection = getVisibleSection(sectionIds, 0.3);
            if (visibleSection) {
                setActiveSection(visibleSection);
            }
        };

        // Use optimized scroll listener with throttling
        const cleanup = onScroll(handleScroll, 100);
        handleScroll(); // Initial check

        return cleanup;
    }, []);

    const scrollToSection = async (sectionId) => {
        setActiveSection(sectionId);
        setIsScrolling(true);

        // Smooth scroll with highlight effect
        await smoothScrollToWithHighlight(`#${sectionId}`, {
            duration: 800,
            offset: 100,
            easing: 'easeInOutCubic'
        });

        setIsScrolling(false);
    };

    const handleScrollToTop = async () => {
        setIsScrolling(true);

        await scrollToTop({
            duration: 600,
            easing: 'easeOutExpo'
        });

        setIsScrolling(false);
    };

    return (
        <nav className={`glass-nav ${isScrolled ? 'scrolled' : ''}`}>
            <div className="glass-nav-container">
                <div className="glass-nav-brand">
                    <div className="brand-icon">📈</div>
                    <div className="brand-text">
                        <span className="brand-name">VQM Tools</span>
                        <span className="brand-tagline">Trading Suite</span>
                    </div>
                </div>

                <div className="glass-nav-items">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            className={`glass-nav-item ${activeSection === item.id ? 'active' : ''}`}
                            onClick={() => scrollToSection(item.id)}
                            aria-label={`Navigate to ${item.label}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <div className="nav-content">
                                <span className="nav-label">{item.label}</span>
                                <span className="nav-description">{item.description}</span>
                            </div>
                            <div className="nav-indicator"></div>
                        </button>
                    ))}
                </div>

                <div className="glass-nav-actions">
                    <button
                        className={`nav-scroll-top ${isScrolling ? 'scrolling' : ''}`}
                        onClick={handleScrollToTop}
                        aria-label="Scroll to top"
                        disabled={isScrolling}
                    >
                        ↑
                    </button>
                </div>
            </div>
        </nav>
    );
}
