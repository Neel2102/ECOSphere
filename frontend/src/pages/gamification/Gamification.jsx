import ModuleShell from '../../components/layout/ModuleShell';
import { useAuth } from '../../context/AuthContext';

const ALL_TABS = [
  { label: 'Challenges', to: '/dashboard/gamification/challenges', icon: 'trophy' },
  { label: 'Challenge Participation', to: '/dashboard/gamification/participation', icon: 'users' },
  { label: 'Categories', to: '/dashboard/gamification/categories', icon: 'tag' },
  { label: 'Badges', to: '/dashboard/gamification/badges', icon: 'award' },
  { label: 'Rewards', to: '/dashboard/gamification/rewards', icon: 'gift' },
  { label: 'Leaderboard', to: '/dashboard/gamification/leaderboard', icon: 'leaderboard' },
];

function Gamification() {
  const { user } = useAuth();

  const tabs = ALL_TABS.filter((tab) => {
    if (user?.role === 'employee') {
      return tab.to.includes('challenges') || tab.to.includes('leaderboard');
    }
    return true; // Admin and manager have all tabs
  });

  return <ModuleShell title="Gamification" tabs={tabs} />;
}

export default Gamification;
