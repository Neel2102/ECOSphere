import ModuleShell from '../../components/layout/ModuleShell';

const TABS = [
  { label: 'CSR Activities', to: '/dashboard/social/activities' },
  { label: 'Employee Participation', to: '/dashboard/social/participation' },
  { label: 'Diversity Dashboard', to: '/dashboard/social/diversity' },
];

function Social() {
  return <ModuleShell title="Social" tabs={TABS} />;
}

export default Social;
