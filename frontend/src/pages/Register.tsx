import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User as UserIcon, ArrowLeft, ArrowRight } from 'lucide-react';

interface RegisterProps {
  onNavigateLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onNavigateLogin }) => {
  const { register } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setLoading(false);
      return setError('A senha deve conter no mínimo 6 caracteres.');
    }

    try {
      await register(nome, email, password);
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950 to-slate-950 px-4 py-12 relative overflow-hidden">
      
      {/* Background Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Back Link */}
        <button
          onClick={onNavigateLogin}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o Login
        </button>

        {/* Card */}
        <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-white/10">
          
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white font-sans">Criar Conta</h3>
            <p className="text-slate-400 text-xs mt-1">Cadastre-se para acessar o controle financeiro completo.</p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl bg-rose-500/10 p-3.5 border border-rose-500/20 text-xs font-semibold text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Nome Field */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Nome Completo</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-900/40 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-white placeholder-slate-600"
                  placeholder="Seu nome completo"
                  required
                />
              </div>
            </div>

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
                  placeholder="Mínimo 6 caracteres"
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
              {loading ? 'Cadastrando...' : (
                <>
                  Criar Conta & Acessar
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
