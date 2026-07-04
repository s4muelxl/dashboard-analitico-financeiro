import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { SaaSPricing } from './pages/SaaSPricing';
import { Admin } from './pages/Admin';
import { Tasks } from './pages/Tasks';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Show page loading spinner during authentication check
  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-2xl shadow-lg shadow-blue-500/25 mb-4 animate-spin">
          ⚡
        </div>
        <p className="text-xs font-semibold text-slate-400">Carregando painel financeiro...</p>
      </div>
    );
  }

  // Unauthenticated screen
  if (!user) {
    return authScreen === 'login' ? (
      <Login onNavigateRegister={() => setAuthScreen('register')} />
    ) : (
      <Register onNavigateLogin={() => setAuthScreen('login')} />
    );
  }

  // Authenticated Dashboard layout
  return (
    <FinanceProvider>
      <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
        
        {/* Navigation Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen} 
        />

        {/* Main Panel Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          
          {/* Header toolbar */}
          <Header 
            activeTab={activeTab} 
            onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
          />

          {/* Scrolling body viewport */}
          <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
            <div className="mx-auto max-w-6xl space-y-6">
              
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'transactions' && <Transactions />}
              {activeTab === 'tasks' && <Tasks />}
              {activeTab === 'saas' && <SaaSPricing />}
              {activeTab === 'admin' && user?.cargo === 'admin' && <Admin />}
              
            </div>
          </main>
        </div>

      </div>
    </FinanceProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
