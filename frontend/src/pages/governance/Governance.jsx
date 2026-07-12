import ModuleShell from '../../components/layout/ModuleShell';

const TABS = [
  { label: 'Policies', to: '/dashboard/governance/policies' },
  { label: 'Policy Acknowledgements', to: '/dashboard/governance/acknowledgements' },
  { label: 'Audits', to: '/dashboard/governance/audits' },
  { label: 'Compliance Issues', to: '/dashboard/governance/issues' },
];

function Governance() {
  return <ModuleShell title="Governance" tabs={TABS} />;
}

export default Governance;
