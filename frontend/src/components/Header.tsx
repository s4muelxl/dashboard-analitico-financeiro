import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, Menu, Database, DatabaseZap } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onMenuToggle }) => {
  const { theme, toggleTheme, mockMode, toggleMockMode, user } = useAuth();

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard Executivo';
      case 'transactions':
        return 'Controle Financeiro';
      case 'tasks':
        return 'Rotina Semanal & Hábitos';
      case 'saas':
        return 'Gerenciar Assinatura SaaS';
      case 'admin':
        return 'Painel de Auditoria & Admin';
      default:
        return 'Strong Finance';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 px-6 backdrop-blur-md">
      {/* Mobile Toggle & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white font-sans md:text-2xl">
          {getPageTitle(activeTab)}
        </h1>
      </div>

      {/* Toggles & Profile Controls */}
      <div className="flex items-center gap-3.5 md:gap-5">
        
        {/* Mock Mode Control Switcher */}
        <div className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-900 p-1.5 px-3 border border-slate-200/50 dark:border-slate-800">
          <button
            onClick={() => toggleMockMode(!mockMode)}
            className="flex items-center gap-2 text-xs font-semibold focus:outline-none transition-colors"
            title={mockMode ? 'Usando LocalStorage temporário. Clique para mudar para Banco Real Node/Express.' : 'Usando Banco Real Node/Express. Clique para mudar para Modo de Teste.'}
          >
            {mockMode ? (
              <>
                <DatabaseZap className="h-4 w-4 text-emerald-500 animate-pulse" />
                <span className="hidden sm:inline text-emerald-600 dark:text-emerald-400">Modo Teste</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping absolute -mt-3.5 ml-16 hidden sm:block" />
              </>
            ) : (
              <>
                <Database className="h-4 w-4 text-blue-500" />
                <span className="hidden sm:inline text-blue-600 dark:text-blue-400">Modo API Real</span>
              </>
            )}
          </button>
        </div>

        {/* Theme Toggler */}
        <button
          onClick={toggleTheme}
          className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-700" />}
        </button>

        {/* Mini Profile Plan Badge */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-slate-400">Plano:</span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider
            ${user?.plan === 'premium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/25' : 
              user?.plan === 'enterprise' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25' : 
              'bg-slate-100 dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-800'}
          `}>
            {user?.plan}
          </span>
        </div>

      </div>
    </header>
  );
};
