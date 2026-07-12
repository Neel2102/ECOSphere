import ModuleShell from '../../components/layout/ModuleShell';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { label: 'CSR Activities', to: '/dashboard/social/activities', icon: 'heart' },
  { label: 'Employee Participation', to: '/dashboard/social/participation', icon: 'users' },
  { label: 'Diversity Dashboard', to: '/dashboard/social/diversity', icon: 'chart' },
  { label: 'Training Completion', to: '/dashboard/social/training', icon: 'book' },
];

function Social() {
  const { user } = useAuth();
  const tabs = user?.role === 'employee'
    ? TABS.filter((t) => t.to.includes('activities'))
    : TABS;

  return <ModuleShell title="Social : CSR & Employee engagement" tabs={tabs} />;
}

export default Social;
