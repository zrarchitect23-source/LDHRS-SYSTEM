import React, { useState, useEffect } from 'react';
import { User } from './types';
import { Login } from './components/Login';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  // Application State
  const [user, setUser] = useState<User>({ username: '', email: '', isAuthenticated: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading or session check
    const timer = setTimeout(() => {
        // Check if user is logged in via localStorage simulation (optional, keeping simple for now)
        setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (username: string, email: string) => {
    setUser({ username, email, isAuthenticated: true });
  };

  const handleLogout = () => {
    setUser({ username: '', email: '', isAuthenticated: false });
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-900"></div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      {user.isAuthenticated ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;