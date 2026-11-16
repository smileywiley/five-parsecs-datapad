import { CampaignProvider, useCampaign } from './state/CampaignContext';
import { Layout } from './components/Layout';
import { DashboardView } from './components/DashboardView';
import { CrewView } from './components/CrewView';
import { ShipView } from './components/ShipView';
import { StashView } from './components/StashView';
import { ContactsView } from './components/ContactsView';
import { MissionsView } from './components/MissionsView';
import { NotesView } from './components/NotesView';

function ActiveView() {
  const { activeTab } = useCampaign();

  switch (activeTab) {
    case 'dashboard':
      return <DashboardView />;
    case 'crew':
      return <CrewView />;
    case 'ship':
      return <ShipView />;
    case 'stash':
      return <StashView />;
    case 'contacts':
      return <ContactsView />;
    case 'missions':
      return <MissionsView />;
    case 'notes':
      return <NotesView />;
    default:
      return <DashboardView />;
  }
}

export default function App() {
  return (
    <CampaignProvider>
      <Layout>
        <ActiveView />
      </Layout>
    </CampaignProvider>
  );
}
