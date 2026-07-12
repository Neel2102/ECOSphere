import ModuleShell from '../../components/layout/ModuleShell';

const TABS = [
  { label: 'Environmental Dashboard', to: '/dashboard/environmental/dashboard', icon: 'activity' },
  { label: 'Emission Factors', to: '/dashboard/environmental/emission-factors', icon: 'sliders' },
  { label: 'Product ESG Profiles', to: '/dashboard/environmental/product-profiles', icon: 'box' },
  { label: 'Carbon Transactions', to: '/dashboard/environmental/carbon-transactions', icon: 'leaf' },
  { label: 'Environmental Goals', to: '/dashboard/environmental/goals', icon: 'target' },
];

function Environmental() {
  return <ModuleShell title="Environmental" tabs={TABS} />;
}

export default Environmental;
