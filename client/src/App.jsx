import './App.css';
import PaymentPage from './components/payment.jsx';
import Sidebar from './components/sidebar.jsx';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UserDataProvider, useUserData } from './providers/userData.jsx';

const AppContent = () => {
  const { userData } = useUserData();
  return (
    <Router>
      <Routes>
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/games" element={<Games />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/login" element={<Login />} />
        <Route path="/channel" element={<ChannelPage />} />
      </Routes>
      {userData?.username ? <Sidebar /> : null}
    </Router>
  );
};

function App() {
  return (
    <UserDataProvider>
      <AppContent />
    </UserDataProvider>
  );
}

export default App;
