import './App.css';
import PaymentPage from './components/payment.jsx';
import Sidebar from './components/sidebar.jsx';
import Games from './components/games.jsx';
import Notifications from './components/Notifications.jsx';
import Login from './components/login.jsx';
import ChannelPage from './components/channel.jsx';
import Register from './components/registration.jsx';
import ActivityLog from './components/ActivityLog.jsx';
import Stories from './components/stories.jsx';
import ProfilePage from './components/Profile.jsx';
import Connect from './components/connect.jsx';
import EditProfile from './components/editProfile.jsx';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UserDataProvider, useUserData } from './providers/userData.jsx';
import EditChannel from './components/editChannel.jsx';
import ChannelHome from './components/channelHome.jsx';
import ChannelPostOverlay from './components/ChannelPostOverlay.jsx';
import HomePage from './components/Landing.jsx';
// import { Home } from 'lucide-react';

const AppContent = () => {
  const { userData } = useUserData();
  return (
    <>
      <Routes>
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/games" element={<Games />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/login" element={<Login />} />
        <Route path="/channel/:channelName" element={<ChannelPage />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/dailyUsage" element={<ActivityLog />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/profile/VoyagerX21" element={<ProfilePage />} />
        <Route path="/connect" element={<Connect />} />
        <Route path="/edit_profile" element={<EditProfile />} />
        <Route path="/edit_channel" element={<EditChannel />} />
        <Route path="/channelhome" element={<ChannelHome />} />
        <Route path="/channel/post/:id" element={<ChannelPostOverlay />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
      {userData?.username ? <Sidebar /> : userData?.channelName ? <Sidebar /> : null}
    </>
  );
};

function App() {
  return (
    <Router>
      <UserDataProvider>
        <AppContent />
      </UserDataProvider>
    </Router>
  );
}

export default App;