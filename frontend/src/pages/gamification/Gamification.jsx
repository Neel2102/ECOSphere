import ModuleShell from '../../components/layout/ModuleShell';

const TABS = [
  { label: 'Challenges', to: '/dashboard/gamification/challenges' },
  { label: 'Challenge Participation', to: '/dashboard/gamification/participation' },
  { label: 'Badges', to: '/dashboard/gamification/badges' },
  { label: 'Rewards', to: '/dashboard/gamification/rewards' },
  { label: 'Leaderboard', to: '/dashboard/gamification/leaderboard' },
];

function Gamification() {
  return <ModuleShell title="Gamification" tabs={TABS} />;
}

export default Gamification;
