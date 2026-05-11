import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import RegisterProfile from './pages/RegisterProfile';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import DirectorDashboard from './pages/DirectorDashboard';
import VenueSettings from './pages/VenueSettings';
import ArtistDashboard from './pages/ArtistDashboard';
import PromoterDashboard from './pages/PromoterDashboard';
import VenueDetail from './pages/VenueDetail';
import BandDetail from './pages/BandDetail';
import PromoterDetail from './pages/PromoterDetail';
import Messages from './pages/Messages';
import InviteAccept from './pages/InviteAccept';
import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import MusicPlayer from './components/MusicPlayer';
import LegalFooter from './components/LegalFooter';
import BanGuard from './components/BanGuard';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-profile" element={<RegisterProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard/director" element={<BanGuard><DirectorDashboard /></BanGuard>} />
        <Route path="/dashboard/artist" element={<BanGuard><ArtistDashboard /></BanGuard>} />
        <Route path="/dashboard/promoter" element={<BanGuard><PromoterDashboard /></BanGuard>} />
        <Route path="/messages" element={<BanGuard><Messages /></BanGuard>} />
        <Route path="/venue/settings/:venueId" element={<BanGuard><VenueSettings /></BanGuard>} />
        <Route path="/venue/:venueId" element={<VenueDetail />} />
        <Route path="/band/:bandId" element={<BandDetail />} />
        <Route path="/promoter/:promoterId" element={<PromoterDetail />} />
        <Route path="/invitation/accept" element={<InviteAccept />} />
        <Route path="/profile" element={<BanGuard><Profile /></BanGuard>} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
      </Routes>
      <MusicPlayer />
      <LegalFooter />
    </>
  );
}

export default App;