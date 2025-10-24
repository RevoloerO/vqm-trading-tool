import PositionSizeCalculator from './components/PositionSizeCalculator';
import RiskRewardCalculator from './components/RiskRewardCalculator';
import './HomePage.css';

export default function HomePage() {
    return (
        <div className='App'>
            <div className="dashboard-container">
                <PositionSizeCalculator />
                <RiskRewardCalculator />
            </div>
        </div>
    );
}