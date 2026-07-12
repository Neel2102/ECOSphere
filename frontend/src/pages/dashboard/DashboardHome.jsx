import { Link } from 'react-router-dom';
import Card from '../../components/common/Card/Card';
import Badge from '../../components/common/Badge/Badge';
import Icon from '../../components/common/Icon/Icon';
import { useAuth } from '../../context/AuthContext';
import { NAV_ITEMS } from '../../components/layout/Sidebar';
import '../../styles/dashboard/dashboard-home.css';

const ROLE_BADGES = {
  admin: 'danger',
  manager: 'info',
  employee: 'success',
  client: 'neutral',
};

function DashboardHome() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(' ')[0] || 'there';

  return (
    <div className="dash-home">
      <Card className="dash-home__hero" padding="lg">
        <div>
          <h1 className="dash-home__greeting">Welcome back, {firstName}!</h1>
          <p className="dash-home__subtitle">
            Pick a workspace from the sidebar to get going.
          </p>
        </div>
        <Badge variant={ROLE_BADGES[user?.role] || 'neutral'}>{user?.role}</Badge>
      </Card>

      <div className="dash-home__grid">
        {NAV_ITEMS.map((item) => (
          <Link key={item.to} to={item.to} className="dash-home__tile">
            <span className="dash-home__tile-icon">
              <Icon name={item.icon} size={24} />
            </span>
            <span className="dash-home__tile-label">{item.label}</span>
            <Icon name="chevronRight" size={16} className="dash-home__tile-arrow" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default DashboardHome;
