import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Elections from './pages/Elections';
import Assets from './pages/Assets';
import Results from './pages/Results';
import Audit from './pages/Audit';
import Security from './pages/Security';
import CreateElection from './pages/CreateElection';

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
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
