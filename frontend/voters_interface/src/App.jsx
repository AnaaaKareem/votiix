import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EnrollmentPage from './pages/EnrollmentPage';
import SelectLanguage from './pages/SelectLanguage';
import VerificationFinger from './pages/VerificationFinger';
import ConfirmationPage from './pages/ConfirmationPage';
import SelectCandidate from './pages/SelectCandidate';
import CandidateConfirmation from './pages/CandidateConfirmation';
import SuccessfulVoting from './pages/SuccessfulVoting';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/enrollment" />} />
        <Route path="/enrollment" element={<EnrollmentPage />} />
        <Route path="/language" element={<SelectLanguage />} />
        <Route path="/verify" element={<VerificationFinger />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/select-candidate" element={<SelectCandidate />} />
        <Route path="/candidate-confirmation" element={<CandidateConfirmation />} />
        <Route path="/success" element={<SuccessfulVoting />} />
      </Routes>
    </Router>
  );
}

export default App;
