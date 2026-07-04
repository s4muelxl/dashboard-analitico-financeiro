import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { ShieldCheck, UserCheck, UserMinus, FileClock, Terminal, Search, AlertCircle } from 'lucide-react';

interface AccessLog {
  id: number;
  user_email: string;
  ip_address: string;
  user_agent: string;
  login_time: string;
}

interface AuditLog {
  id: number;
  user_email: string;
  acao: string;
  detalhes: string;
  timestamp: string;
}

export const Admin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'sessions' | 'audit'>('users');

  // Load administrative information from LocalStorage
  useEffect(() => {
    const loadedUsers: User[] = JSON.parse(localStorage.getItem('sf_users') || '[]');
    setUsers(loadedUsers);

    // Mock logs
    const mockAccessLogs: AccessLog[] = [
      { id: 1, user_email: 'lucas@exemplo.com', ip_address: '192.168.1.102', user_agent: 'Chrome / Windows 11', login_time: new Date(Date.now() - 300000).toLocaleString('pt-BR') },
      { id: 2, user_email: 'admin@strongfinance.com', ip_address: '200.180.20.15', user_agent: 'Firefox / macOS Sonoma', login_time: new Date(Date.now() - 3600000).toLocaleString('pt-BR') },
      { id: 3, user_email: 'maria.silva@exemplo.com', ip_address: '189.15.2.45', user_agent: 'Safari / iPhone 15', login_time: '18/06/2026 09:20:00' },
      { id: 4, user_email: 'rodrigo.oliveira@exemplo.com', ip_address: '177.82.150.12', user_agent: 'Chrome / Android', login_time: '17/06/2026 14:15:30' },
    ];
    setAccessLogs(mockAccessLogs);

    const mockAuditLogs: AuditLog[] = [
      { id: 1, user_email: 'lucas@exemplo.com', acao: 'alteracao', detalhes: 'Criou transação ID 11: - R$45,00 (Uber Trabalho)', timestamp: new Date(Date.now() - 300000).toLocaleString('pt-BR') },
      { id: 2, user_email: 'lucas@exemplo.com', acao: 'cadastro', detalhes: 'Upgrade de plano realizado para PREMIUM', timestamp: new Date(Date.now() - 600000).toLocaleString('pt-BR') },
      { id: 3, user_email: 'admin@strongfinance.com', acao: 'login', detalhes: 'Administrador realizou login com sucesso', timestamp: new Date(Date.now() - 3600000).toLocaleString('pt-BR') },
      { id: 4, user_email: 'rodrigo.oliveira@exemplo.com', acao: 'exclusao', detalhes: 'Excluiu transação ID 90: - R$150,00', timestamp: '17/06/2026 15:00:10' },
    ];
    setAuditLogs(mockAuditLogs);
  }, []);

  const handleToggleUserStatus = (userId: number) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === 'ativo' ? 'bloqueado' : 'ativo';
        return { ...u, status: newStatus as 'ativo' | 'bloqueado' };
      }
      return u;
    });
    setUsers(updated);
    localStorage.setItem('sf_users', JSON.stringify(updated));
  };

  const filteredUsers = users.filter(u => 
    u.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider block">Usuários Cadastrados</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 block">{users.length}</span>
          </div>
          <div className="h-10 w-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center border border-blue-500/15">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider block">Acessos Hoje</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 block">{accessLogs.length}</span>
          </div>
          <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center border border-emerald-500/15">
            <FileClock className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider block">Ações de Auditoria</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 block">{auditLogs.length}</span>
          </div>
          <div className="h-10 w-10 bg-violet-500/10 text-violet-500 rounded-xl flex items-center justify-center border border-violet-500/15">
            <Terminal className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-3 text-sm font-semibold transition-all ${
            activeTab === 'users'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Usuários
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-5 py-3 text-sm font-semibold transition-all ${
            activeTab === 'sessions'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Sessões Ativas
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-5 py-3 text-sm font-semibold transition-all ${
            activeTab === 'audit'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Logs de Auditoria
        </button>
      </div>

      {/* Search Input for Users */}
      {activeTab === 'users' && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-450" />
          <input
            type="text"
            placeholder="Pesquisar usuários..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:text-white"
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* USERS TABLE */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/40 text-slate-450 font-bold border-b border-slate-250/30 dark:border-slate-800">
                  <th className="p-4">Nome</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Plano SaaS</th>
                  <th className="p-4">Cargo</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900/60">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 text-slate-650 dark:text-slate-300">
                    <td className="p-4 font-semibold text-slate-850 dark:text-white">{u.nome}</td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        u.plan === 'premium' ? 'bg-amber-500/10 text-amber-500' :
                        u.plan === 'enterprise' ? 'bg-indigo-500/10 text-indigo-400' :
                        'bg-slate-100 dark:bg-slate-900 text-slate-400'
                      }`}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="p-4 font-medium uppercase text-[10px] text-slate-400">{u.cargo}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'ativo' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${u.status === 'ativo' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {u.status === 'ativo' ? 'Ativo' : 'Bloqueado'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {u.cargo !== 'admin' ? (
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg border text-[10px] font-semibold transition-colors
                            ${u.status === 'ativo'
                              ? 'border-rose-200 dark:border-rose-950/40 text-rose-500 hover:bg-rose-550/10'
                              : 'border-emerald-200 dark:border-emerald-950/40 text-emerald-500 hover:bg-emerald-550/10'
                            }
                          `}
                        >
                          {u.status === 'ativo' ? (
                            <>
                              <UserMinus className="h-3 w-3" />
                              Bloquear
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3 w-3" />
                              Reativar
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold italic">Protegido</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SESSIONS TABLE */}
        {activeTab === 'sessions' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/40 text-slate-450 font-bold border-b border-slate-250/30 dark:border-slate-800">
                  <th className="p-4">Usuário</th>
                  <th className="p-4">Endereço IP</th>
                  <th className="p-4">Dispositivo / User Agent</th>
                  <th className="p-4">Data/Hora de Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900/60">
                {accessLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 text-slate-650 dark:text-slate-300">
                    <td className="p-4 font-semibold text-slate-850 dark:text-white">{log.user_email}</td>
                    <td className="p-4 font-mono text-slate-500">{log.ip_address}</td>
                    <td className="p-4">{log.user_agent}</td>
                    <td className="p-4">{log.login_time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/40 text-slate-450 font-bold border-b border-slate-250/30 dark:border-slate-800">
                  <th className="p-4">Data/Hora</th>
                  <th className="p-4">Usuário</th>
                  <th className="p-4">Ação</th>
                  <th className="p-4">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900/60 font-mono">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 text-slate-600 dark:text-slate-400">
                    <td className="p-4 text-[10px] text-slate-450">{log.timestamp}</td>
                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{log.user_email}</td>
                    <td className="p-4">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase
                        ${log.acao === 'cadastro' ? 'bg-blue-500/10 text-blue-400' :
                          log.acao === 'exclusao' ? 'bg-rose-500/10 text-rose-400' :
                          'bg-amber-500/10 text-amber-400'}
                      `}>
                        {log.acao}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-sans text-slate-800 dark:text-slate-350">{log.detalhes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};
