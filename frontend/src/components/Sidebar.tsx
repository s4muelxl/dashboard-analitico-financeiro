import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  ShieldAlert, 
  LogOut, 
  User as UserIcon,
  X,
  CalendarRange
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transações', icon: ArrowLeftRight },
    { id: 'tasks', label: 'Rotina Semanal', icon: CalendarRange },
  ];

  // Only show Admin Panel if user is Administrator
  if (user?.cargo === 'admin') {
    menuItems.push({ id: 'admin', label: 'Painel Admin', icon: ShieldAlert });
  }

  const handleNav = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpen(false); // Close mobile menu after clicking
  };

  const getPlanBadgeStyles = (plan?: string) => {
    switch (plan) {
      case 'premium':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-orange-500/20';
      case 'enterprise':
        return 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm shadow-indigo-500/20';
      default:
        return 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  };

  return (
    <>
      {/* Mobile Sidebar overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 flex w-72 flex-col 
        border-r border-slate-200 dark:border-slate-850
        bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100
        transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header/Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-850">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-xl shadow-md shadow-blue-500/25">
              ⚡
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight font-sans">Strong Finance</span>
              <span className="block text-[10px] text-blue-500 font-semibold tracking-wider uppercase">SaaS Plataforma</span>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-850">
          <div className="flex items-center gap-3.5 bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-900">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold">
              {user?.nome ? user.nome.charAt(0).toUpperCase() : <UserIcon className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-none text-slate-900 dark:text-slate-100">{user?.nome}</p>
              <p className="truncate text-xs text-slate-400 mt-1">{user?.email}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getPlanBadgeStyles(user?.plan)}`}>
                  {user?.plan === 'free' ? 'Plano Grátis' : user?.plan === 'premium' ? 'Premium' : 'Enterprise'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`
                  flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-semibold border-l-4 border-blue-600 dark:border-blue-500 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-slate-100'
                  }
                `}
              >
                <IconComponent className={`h-5 w-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer / Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-850">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
          >
            <LogOut className="h-5 w-5 text-rose-500" />
            Sair da Conta
          </button>
        </div>
      </aside>
    </>
  );
};
