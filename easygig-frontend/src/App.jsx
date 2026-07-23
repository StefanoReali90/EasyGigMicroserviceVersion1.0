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
import { useAuthStore } from './store/authStore';
import { Loader2 } from 'lucide-react';

import ProtectedRoute from './components/ProtectedRoute';
import BanGuard from './components/BanGuard';

import { useState, useEffect } from 'react';

function App() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const checkHydration = () => {
      if (useAuthStore.persist.hasHydrated()) {
        setIsHydrated(true);
      }
    };

    checkHydration();
    const unsub = useAuthStore.persist.onFinishHydration(checkHydration);
    return unsub;
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-easygig-dark flex items-center justify-center">
        <Loader2 className="animate-spin text-easygig-accent" size={48} />
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-profile" element={<RegisterProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard/director" element={<ProtectedRoute><BanGuard><DirectorDashboard /></BanGuard></ProtectedRoute>} />
        <Route path="/dashboard/artist" element={<ProtectedRoute><BanGuard><ArtistDashboard /></BanGuard></ProtectedRoute>} />
        <Route path="/dashboard/promoter" element={<ProtectedRoute><BanGuard><PromoterDashboard /></BanGuard></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><BanGuard><Messages /></BanGuard></ProtectedRoute>} />
        <Route path="/venue/settings/:venueId" element={<ProtectedRoute><BanGuard><VenueSettings /></BanGuard></ProtectedRoute>} />
        <Route path="/venue/:venueId" element={<VenueDetail />} />
        <Route path="/band/:bandId" element={<BandDetail />} />
        <Route path="/promoter/:promoterId" element={<PromoterDetail />} />
        <Route path="/invitation/accept" element={<InviteAccept />} />
        <Route path="/profile" element={<ProtectedRoute><BanGuard><Profile /></BanGuard></ProtectedRoute>} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
      </Routes>
      <MusicPlayer />
      <LegalFooter />
    </>
  );
}

export default App;