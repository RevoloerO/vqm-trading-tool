import { useState, useEffect } from 'react';
import './GlassNav.css';

export default function GlassNav() {
    const [activeSection, setActiveSection] = useState('position-size');
    const [isScrolled, setIsScrolled] = useState(false);

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

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);

            // Detect which section is in view
            const sections = navItems.map(item =>
                document.getElementById(item.id)
            );

            const scrollPosition = window.scrollY + window.innerHeight / 3;

            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                if (section && section.offsetTop <= scrollPosition) {
                    setActiveSection(navItems[i].id);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const offset = 100; // Offset for fixed nav
            const elementPosition = element.offsetTop - offset;
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
            setActiveSection(sectionId);
        }
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
                        className="nav-scroll-top"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        aria-label="Scroll to top"
                    >
                        ↑
                    </button>
                </div>
            </div>
        </nav>
    );
}
