/**
 * Main App Component
 * Handles routing between login and dashboard based on auth state
 */

import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import './App.css';

function App() {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner-large"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Show login if not authenticated, otherwise show dashboard
  return user ? <Dashboard /> : <Login />;
}

export default App;
