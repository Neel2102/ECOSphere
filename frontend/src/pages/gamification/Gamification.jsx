import ModuleShell from '../../components/layout/ModuleShell';

const TABS = [
  { label: 'Challenges', to: '/dashboard/gamification/challenges', icon: 'trophy' },
  { label: 'Challenge Participation', to: '/dashboard/gamification/participation', icon: 'users' },
  { label: 'Badges', to: '/dashboard/gamification/badges', icon: 'award' },
  { label: 'Rewards', to: '/dashboard/gamification/rewards', icon: 'gift' },
  { label: 'Leaderboard', to: '/dashboard/gamification/leaderboard', icon: 'leaderboard' },
];

function Gamification() {
  return <ModuleShell title="Gamification" tabs={TABS} />;
}

export default Gamification;
