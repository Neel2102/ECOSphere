import ModuleShell from '../../components/layout/ModuleShell';

const TABS = [
  { label: 'CSR Activities', to: '/dashboard/social/activities', icon: 'heart' },
  { label: 'Employee Participation', to: '/dashboard/social/participation', icon: 'users' },
  { label: 'Diversity Dashboard', to: '/dashboard/social/diversity', icon: 'chart' },
  { label: 'Training Completion', to: '/dashboard/social/training', icon: 'book' },
];

function Social() {
  return <ModuleShell title="Social" tabs={TABS} />;
}

export default Social;
