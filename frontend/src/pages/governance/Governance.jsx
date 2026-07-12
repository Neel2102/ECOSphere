import ModuleShell from '../../components/layout/ModuleShell';

const TABS = [
  { label: 'Policies', to: '/dashboard/governance/policies', icon: 'file' },
  { label: 'Policy Acknowledgements', to: '/dashboard/governance/acknowledgements', icon: 'checkCircle' },
  { label: 'Audits', to: '/dashboard/governance/audits', icon: 'search' },
  { label: 'Compliance Issues', to: '/dashboard/governance/issues', icon: 'alert' },
];

function Governance() {
  return <ModuleShell title="Governance" tabs={TABS} />;
}

export default Governance;
