import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import RFQs from './pages/RFQs';
import Quotes from './pages/Quotes';
import Inventory from './pages/Inventory';
import PurchaseOrders from './pages/PurchaseOrders';
import Login from './pages/Login';

export default function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <DashboardLayout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/rfqs" element={<RFQs />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/pos" element={<PurchaseOrders />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
}
