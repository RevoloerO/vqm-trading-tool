import { lazy, Suspense } from 'react';
import ThemeToggle3Way from './components/ThemeToggle/ThemeToggle3Way';
import GlassNav from './components/GlassNav/GlassNav';
import './HomePage.css';

// Code splitting: Lazy load calculator components for better performance
const PositionSizeCalculator = lazy(() => import('./components/PositionSizeCalculator'));
const RiskRewardCalculator = lazy(() => import('./components/RiskRewardCalculator'));
const MTFChecklist = lazy(() => import('./components/MTFChecklist/MTFChecklistRefactored'));

// Loading fallback component
function LoadingFallback() {
    return (
        <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--text-color, #666)',
            fontStyle: 'italic'
        }}>
            Loading calculator...
        </div>
    );
}

export default function HomePage() {
    return (
        <div className='App'>
            <GlassNav />

            <div className="dashboard-header">
                <h1 className="dashboard-title">VQM Trading Tools</h1>
                <ThemeToggle3Way />
            </div>

            <div className="dashboard-container">
                <Suspense fallback={<LoadingFallback />}>
                    <section id="position-size" className="calculator-section">
                        <PositionSizeCalculator />
                    </section>
                </Suspense>

                <Suspense fallback={<LoadingFallback />}>
                    <section id="risk-reward" className="calculator-section">
                        <RiskRewardCalculator />
                    </section>
                </Suspense>

                <Suspense fallback={<LoadingFallback />}>
                    <section id="mtf-checklist" className="calculator-section">
                        <MTFChecklist />
                    </section>
                </Suspense>
            </div>
        </div>
    );
}