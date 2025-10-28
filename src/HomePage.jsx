import PositionSizeCalculator from './components/PositionSizeCalculator';
import RiskRewardCalculator from './components/RiskRewardCalculator';
import MTFChecklist from './components/MTFChecklist/MTFChecklist';
import ThemeToggle from './components/ThemeToggle/ThemeToggle';
import './HomePage.css';

export default function HomePage() {
    return (
        <div className='App'>
            <div className="dashboard-header">
                <h1 className="dashboard-title">VQM Trading Tools</h1>
                <ThemeToggle />
            </div>
            <div className="dashboard-container">
                <PositionSizeCalculator />
                <RiskRewardCalculator />
                <MTFChecklist />
            </div>
        </div>
    );
}