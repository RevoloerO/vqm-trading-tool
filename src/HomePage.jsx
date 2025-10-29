import PositionSizeCalculator from './components/PositionSizeCalculator';
import RiskRewardCalculator from './components/RiskRewardCalculator';
import MTFChecklist from './components/MTFChecklist/MTFChecklist';
import ThemeToggle3Way from './components/ThemeToggle/ThemeToggle3Way';
import GlassNav from './components/GlassNav/GlassNav';
import './HomePage.css';

export default function HomePage() {
    return (
        <div className='App'>
            <GlassNav />

            <div className="dashboard-header">
                <h1 className="dashboard-title">VQM Trading Tools</h1>
                <ThemeToggle3Way />
            </div>

            <div className="dashboard-container">
                <section id="position-size" className="calculator-section">
                    <PositionSizeCalculator />
                </section>

                <section id="risk-reward" className="calculator-section">
                    <RiskRewardCalculator />
                </section>

                <section id="mtf-checklist" className="calculator-section">
                    <MTFChecklist />
                </section>
            </div>
        </div>
    );
}