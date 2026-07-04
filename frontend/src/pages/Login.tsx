import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ShieldCheck, DatabaseZap, ArrowRight } from 'lucide-react';

interface LoginProps {
  onNavigateRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigateRegister }) => {
  const { login, mockMode, toggleMockMode } = useAuth();
  const [email, setEmail] = useState('lucas@exemplo.com'); // Autofill default mock account
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (selectedEmail: string) => {
    setEmail(selectedEmail);
    setPassword('123456');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950 to-slate-950 px-4 py-12 relative overflow-hidden">
      
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-3xl shadow-lg shadow-blue-500/25 mb-4 animate-bounce-subtle">
            ⚡
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white font-sans">Strong Finance</h2>
          <p className="text-slate-400 text-sm mt-1.5 font-medium">Seu SaaS de inteligência financeira & hábitos</p>
        </div>

        {/* Card */}
        <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-white/10 relative">
          
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Fazer Login</h3>
            <button
              onClick={() => toggleMockMode(!mockMode)}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              title="Alternar entre modo teste local e conexão real com o banco"
            >
              <DatabaseZap className="h-3.5 w-3.5" />
              {mockMode ? 'Modo Teste Ativo' : 'Banco Real'}
            </button>
          </div>

          {error && (
            <div className="mb-5 rounded-xl bg-rose-500/10 p-3.5 border border-rose-500/20 text-xs font-semibold text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Endereço de E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-900/40 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-white placeholder-slate-600"
                  placeholder="seuemail@exemplo.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-900/40 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-white placeholder-slate-600"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? 'Autenticando...' : (
                <>
                  Entrar no Dashboard
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Quick Mock Login helpers */}
          {mockMode && (
            <div className="mt-6 border-t border-slate-800/80 pt-5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-3">Acesso Rápido para Testes:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickLogin('lucas@exemplo.com')}
                  className="py-2 px-3 bg-slate-900 hover:bg-slate-850 rounded-lg text-left border border-slate-800 transition-colors"
                >
                  <span className="block text-xs font-semibold text-slate-200">Lucas (Cliente)</span>
                  <span className="text-[9px] text-slate-500">Plano Premium</span>
                </button>
                <button
                  onClick={() => handleQuickLogin('admin@strongfinance.com')}
                  className="py-2 px-3 bg-slate-900 hover:bg-slate-850 rounded-lg text-left border border-slate-800 transition-colors"
                >
                  <span className="block text-xs font-semibold text-slate-200">Admin</span>
                  <span className="text-[9px] text-slate-500">Enterprise</span>
                </button>
              </div>
            </div>
          )}

          {/* Bottom redirection Link */}
          <div className="mt-6 text-center">
            <button
              onClick={onNavigateRegister}
              className="text-xs text-slate-400 hover:text-blue-400 font-semibold transition-colors"
            >
              Não possui uma conta? <span className="text-blue-500 font-bold">Criar Cadastro</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
