import './App.css';
import PaymentPage from './components/payment.jsx';
import Sidebar from './components/sidebar.jsx';
import Games from './components/games.jsx';
import Notifications from './components/Notifications.jsx';
import Login from './components/login.jsx';
import ChannelPage from './components/channel.jsx';
import Register from './components/registration.jsx';
import ActivityLog from './components/ActivityLog.jsx';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UserDataProvider, useUserData } from './providers/userData.jsx';

const AppContent = () => {
  const { userData } = useUserData();
  return (
    <>
      <Routes>
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/games" element={<Games />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/login" element={<Login />} />
        <Route path="/channel" element={<ChannelPage />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/dailyUsage" element={<ActivityLog />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/dailyUsage" element={<ActivityLog />} />
      </Routes>
      {userData?.username ? <Sidebar /> : null}
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
