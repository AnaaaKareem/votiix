import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ViewerLayout from './components/layout/ViewerLayout';
import Elections from './pages/Elections';
import Assets from './pages/Assets';
import Results from './pages/Results';
import Audit from './pages/Audit';
import Security from './pages/Security';
import CreateElection from './pages/CreateElection';
import LiveElectionAdmin from './pages/LiveElectionAdmin';
import ViewerLive from './pages/ViewerLive';
import ViewerLiveSelection from './pages/ViewerLiveSelection';
import ViewerArchive from './pages/ViewerArchive';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Elections />} />
          <Route path="create-election" element={<CreateElection />} />
          <Route path="assets" element={<Assets />} />
          <Route path="results" element={<Results />} />
          <Route path="audit" element={<Audit />} />
          <Route path="security" element={<Security />} />
          <Route path="live-admin" element={<LiveElectionAdmin />} />
        </Route>

        <Route path="/public" element={<ViewerLayout />}>
          <Route path="live" element={<ViewerLiveSelection />} />
          <Route path="live/details" element={<ViewerLive />} />
          <Route path="archive" element={<ViewerArchive />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

