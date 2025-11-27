import './App.css';
import PaymentPage from './components/payment.jsx';
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
import CreatePost from './components/create_post.jsx';
import ImageEditor from './components/create_post_2.jsx';
import FinalizePost from './components/finalize_post.jsx';
import TandC from './components/TandC.jsx';
import Help from  './components/Help.jsx';
import Contact from './components/Contact.jsx';
import Reels from './components/Reels.jsx';
import ChannelRegistration from './components/channelregistration.jsx';
import Settings from './components/settings.jsx';
// import { Home } from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';

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
        <Route path="/activityLog" element={<ActivityLog />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/connect" element={<Connect />} />
        <Route path="/edit_profile" element={<EditProfile />} />
        <Route path="/edit_channel" element={<EditChannel />} />
        <Route path="/channelhome" element={<ChannelHome />} />
        <Route path="/channel/post/:id" element={<ChannelPostOverlay />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/create_post" element={<CreatePost />} />
        <Route path="/edit_post" element={<ImageEditor />} />
        <Route path="/finalize_post" element={<FinalizePost />} />
        <Route path="/help" element={<Help />} />
        <Route path="/terms" element={<TandC />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/reels" element={<Reels />} />
        <Route path="/channelregistration" element={<ChannelRegistration />} />
        <Route path="/settings" element={<Settings />} />
          
      </Routes>
      {userData?.username ? (
        <Sidebar />
      ) : userData?.channelName ? (
        <Sidebar />
      ) : null}
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