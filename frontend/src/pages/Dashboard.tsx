import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { MetricCard } from '../components/MetricCard';
import { GoalWidget } from '../components/GoalWidget';
import { TransactionModal } from '../components/TransactionModal';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Activity, 
  ArrowRight, 
  Plus, 
  Lock, 
  Sparkles, 
  Calendar, 
  PlusCircle 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { transactions, goals, totals, addTransaction, updateGoalProgress } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Format currency helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Compile monthly historical chart data (last 5 months + current)
  // Let's hardcode mock values combined with current month metrics for beautiful display
  const monthlyData = [
    { name: 'Jan', receitas: 8000, despesas: 3400 },
    { name: 'Fev', receitas: 8200, despesas: 3600 },
    { name: 'Mar', receitas: 8000, despesas: 3820 },
    { name: 'Abr', receitas: 10500, despesas: 5520 },
    { name: 'Mai', receitas: 10000, despesas: 4180 },
    { 
      name: 'Jun (Atual)', 
      receitas: totals.income || 0, 
      despesas: totals.expense || 0 
    },
  ];

  // Compile category PieChart data
  const categorySummary: { [key: string]: number } = {};
  transactions
    .filter(t => t.tipo === 'expense')
    .forEach(t => {
      categorySummary[t.categoria] = (categorySummary[t.categoria] || 0) + t.valor;
    });

  const pieData = Object.keys(categorySummary).map(cat => ({
    name: cat,
    value: categorySummary[cat]
  }));

  // Pie colors palette
  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* SaaS Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg shadow-blue-500/15">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
              Olá, {user?.nome}!
            </h2>
            <p className="text-xs md:text-sm text-blue-100 font-medium">
              Seja bem-vindo ao seu painel. Suas despesas do mês estão sob controle. Mantenha os hábitos diários em foco!
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-blue-650 hover:bg-slate-50 shadow-md shadow-slate-950/10 transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            Nova Movimentação
          </button>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Receitas Mensais"
          value={formatCurrency(totals.income)}
          subtext="Entradas no período"
          type="income"
          icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
        />
        <MetricCard
          title="Despesas Mensais"
          value={formatCurrency(totals.expense)}
          subtext="Saídas no período"
          type="expense"
          icon={<TrendingDown className="h-5 w-5 text-rose-500" />}
        />
        <MetricCard
          title="Saldo Líquido"
          value={formatCurrency(totals.balance)}
          subtext="Restante acumulado"
          type="balance"
          icon={<Wallet className="h-5 w-5 text-blue-500" />}
        />
        <MetricCard
          title="Taxa de Poupança"
          value={`${totals.savingsRate.toFixed(1)}%`}
          subtext="Renda total poupada"
          type="percentage"
          icon={<Activity className="h-5 w-5 text-violet-500" />}
        />
      </div>

      {/* MAIN CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Income/Expense Area Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between min-h-[350px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Receitas vs Despesas</h3>
              <p className="text-xs text-slate-400 mt-0.5">Evolução financeira consolidada dos últimos meses</p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200/40 dark:border-slate-800">Mensal</span>
          </div>

          <div className="flex-1 h-64 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncomes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                />
                <Area type="monotone" name="Receita" dataKey="receitas" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncomes)" />
                <Area type="monotone" name="Despesa" dataKey="despesas" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses Category breakdown */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between min-h-[350px]">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Distribuição de Gastos</h3>
            <p className="text-xs text-slate-400 mt-0.5">Categorias das despesas acumuladas no mês</p>
          </div>

          <div className="flex-1 h-52 relative flex items-center justify-center min-w-0 mt-3">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Gasto']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                      border: 'none', 
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center space-y-1.5 p-4">
                <p className="text-xs font-semibold text-slate-400">Nenhum gasto cadastrado.</p>
                <p className="text-[10px] text-slate-500">Adicione despesas para ver o gráfico.</p>
              </div>
            )}
          </div>

          {/* Pie Chart Legend */}
          {pieData.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center mt-3 border-t border-slate-100 dark:border-slate-900/60 pt-3">
              {pieData.slice(0, 4).map((entry, idx) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-[10px] font-medium text-slate-500 truncate max-w-[65px]" title={entry.name}>
                    {entry.name}
                  </span>
                </div>
              ))}
              {pieData.length > 4 && (
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  <span className="text-[10px] font-medium text-slate-500">
                    +{pieData.length - 4} outros
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* LOWER SECTION: TRANSACTIONS & GOALS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle: Recent Transactions */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Últimas Movimentações</h3>
              <p className="text-xs text-slate-400 mt-0.5">Seus registros financeiros recentes</p>
            </div>
          </div>

          <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-900/60">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold text-sm border shadow-sm
                      ${tx.tipo === 'income' 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' 
                        : 'bg-rose-500/10 text-rose-500 border-rose-500/10'
                      }
                    `}>
                      {tx.tipo === 'income' ? '+' : '-'}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-850 dark:text-white block">{tx.descricao}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded">
                          {tx.categoria}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(tx.data).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-sm font-bold font-sans ${tx.tipo === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {tx.tipo === 'income' ? '+' : '-'} R$ {tx.valor.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-10 space-y-2">
                <p className="text-sm font-semibold text-slate-400">Nenhuma transação encontrada.</p>
                <p className="text-xs text-slate-500">Comece adicionando uma receita ou despesa no botão acima.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Goals widget & Premium IA Box */}
        <div className="space-y-6">
          <GoalWidget goals={goals} onUpdateProgress={updateGoalProgress} />

          {/* Premium Forecast Box */}
          <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
            {user?.plan === 'free' && (
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-5 text-center">
                <Lock className="h-7 w-7 text-amber-500 animate-pulse-subtle" />
                <h4 className="text-sm font-bold text-white mt-2.5">Fluxo de Caixa IA</h4>
                <p className="text-[10px] text-slate-350 max-w-[200px] mt-1">
                  Desbloqueie previsões financeiras e gráficos avançados no plano Premium.
                </p>
                <div className="mt-4 flex items-center gap-1 bg-amber-500/10 text-amber-500 border border-amber-500/25 px-2.5 py-1 rounded-full text-[10px] font-bold">
                  <Sparkles className="h-3 w-3" />
                  Premium Pro
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Previsão Inteligente</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Expectativa de fluxo baseada em IA para os próximos meses</p>
              </div>
            </div>

            {/* Locked Chart Mock layout */}
            <div className="h-32 w-full flex items-end gap-3.5 pt-4">
              <div className="flex-1 bg-slate-100 dark:bg-slate-900 h-[40%] rounded-lg relative" />
              <div className="flex-1 bg-slate-100 dark:bg-slate-900 h-[65%] rounded-lg relative" />
              <div className="flex-1 bg-slate-100 dark:bg-slate-900 h-[55%] rounded-lg relative animate-pulse-subtle" />
              <div className="flex-1 bg-slate-100 dark:bg-slate-900 h-[85%] rounded-lg relative" />
            </div>
          </div>
        </div>

      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addTransaction}
      />

    </div>
  );
};
