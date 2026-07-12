import ModuleShell from '../../components/layout/ModuleShell';

const TABS = [
  { label: 'Environmental Dashboard', to: '/dashboard/environmental/dashboard' },
  { label: 'Emission Factors', to: '/dashboard/environmental/emission-factors' },
  { label: 'Product ESG Profiles', to: '/dashboard/environmental/product-profiles' },
  { label: 'Carbon Transactions', to: '/dashboard/environmental/carbon-transactions' },
  { label: 'Environmental Goals', to: '/dashboard/environmental/goals' },
];

function Environmental() {
  return <ModuleShell title="Environmental" tabs={TABS} />;
}

export default Environmental;
