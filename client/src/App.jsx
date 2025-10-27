import './App.css';
import PaymentPage from './components/payment.jsx';
import Sidebar from './components/sidebar.jsx';
import Games from './components/games.jsx';
import Notifications from './components/Notifications.jsx';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/games" element={<Games />} />
        <Route path="/notifications" element={<Notifications />} />
        {/* <Route path="/games" element={<GamesPage />} /> */}
      </Routes>
      <Sidebar />
    </Router>
  );
}

export default App;
