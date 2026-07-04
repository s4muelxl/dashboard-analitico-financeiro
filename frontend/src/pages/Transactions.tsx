import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { Transaction, TransactionType } from '../types';
import { TransactionModal } from '../components/TransactionModal';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  Tag, 
  DollarSign, 
  ArrowUpDown,
  Lock,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export const Transactions: React.FC = () => {
  const { user } = useAuth();
  const { 
    transactions, 
    filters, 
    setFilters, 
    addTransaction, 
    updateTransaction, 
    deleteTransaction, 
    totals,
    refreshData
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Predefined lists for filter options
  const CATEGORIES = ['all', 'Salário', 'Freelance', 'Investimentos', 'Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Assinaturas', 'Outros'];

  // Sorting
  const sortedTransactions = [...transactions].sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.data).getTime() - new Date(a.data).getTime();
    if (sortBy === 'date-asc') return new Date(a.data).getTime() - new Date(b.data).getTime();
    if (sortBy === 'amount-desc') return b.valor - a.valor;
    if (sortBy === 'amount-asc') return a.valor - b.valor;
    return 0;
  });

  const handleEditClick = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (txData: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, txData);
    } else {
      await addTransaction(txData);
    }
  };

  const handleDeleteClick = async (id: number) => {
    if (window.confirm('Tem certeza de que deseja excluir esta movimentação?')) {
      await deleteTransaction(id);
    }
  };

  // EXPORT ENGINE
  const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
    setShowExportMenu(false);

    // SaaS validation: Free plan is restricted to PDF only
    if (format !== 'pdf' && user?.plan === 'free') {
      alert('🔒 Recurso Bloqueado! Exportações avançadas (CSV e Excel) estão disponíveis apenas nos planos Premium. Faça o upgrade na aba "Assinatura SaaS"!');
      return;
    }

    const token = localStorage.getItem('sf_token');
    const queryParams = new URLSearchParams();
    queryParams.append('period', filters.period);
    queryParams.append('type', filters.type);
    queryParams.append('category', filters.category);
    if (token) queryParams.append('token', token);

    // If Mock Mode, do client-side mock download
    const isMock = localStorage.getItem('sf_mock_mode') === 'true';

    if (isMock) {
      if (format === 'csv' || format === 'excel') {
        // Generate CSV file via Browser Blob API
        const csvHeaders = 'Data;Descrição;Tipo;Categoria;Valor (R$);Observações\n';
        const csvRows = sortedTransactions.map(t => {
          const formattedDate = new Date(t.data).toLocaleDateString('pt-BR');
          const typeLabel = t.tipo === 'income' ? 'Receita' : 'Despesa';
          const formattedAmount = t.valor.toFixed(2).replace('.', ',');
          const note = t.observacao ? t.observacao.replace(/[\n\r;]/g, ' ') : '';
          return `"${formattedDate}";"${t.descricao}";"${typeLabel}";"${t.categoria}";"${formattedAmount}";"${note}"`;
        }).join('\n');

        const blob = new Blob(['\uFEFF' + csvHeaders + csvRows], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `relatorio_financeiro_${filters.period || 'all'}.${format === 'csv' ? 'csv' : 'xlsx'}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // PDF Export Mock trigger
        alert('Simulando geração de PDF para download... Em produção, isso envia o payload ao backend PDFKit.');
        window.print();
      }
    } else {
      // Real backend triggers
      if (format === 'pdf') {
        window.open(`/api/reports/pdf?${queryParams.toString()}`, '_blank');
      } else if (format === 'csv') {
        window.open(`/api/reports/csv?${queryParams.toString()}`, '_blank');
      } else {
        window.open(`/api/reports/excel?${queryParams.toString()}`, '_blank');
      }
    }
  };

  const getPlanLimitWarning = () => {
    if (user?.plan !== 'free') return null;
    const currentMonthTxs = transactions.filter(t => {
      const date = new Date(t.data);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });

    return (
      <div className="rounded-2xl bg-amber-500/10 p-4 border border-amber-500/20 text-amber-500 text-xs font-semibold flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 shrink-0 animate-pulse-subtle" />
          <span>Você usou {currentMonthTxs.length}/10 cadastros mensais do plano gratuito. Faça upgrade para cadastros ilimitados!</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* SaaS Limit alert indicator */}
      {getPlanLimitWarning()}

      {/* FILTER PANEL */}
      <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Filter className="h-4.5 w-4.5 text-blue-500" />
            Filtros & Buscas
          </h3>
          
          <div className="flex items-center gap-3">
            {/* New transaction button */}
            <button
              onClick={handleCreateClick}
              className="flex h-9 items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 shadow-sm shadow-blue-500/10 transition-all shrink-0"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                <Download className="h-4 w-4" />
                Exportar
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>
              
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1.5 shadow-xl z-40 animate-slide-up">
                  <button
                    onClick={() => handleExport('pdf')}
                    className="flex w-full items-center gap-2 px-3.5 py-2.5 rounded-lg text-left text-xs font-semibold text-slate-700 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    Relatório em PDF
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="flex w-full items-center justify-between px-3.5 py-2.5 rounded-lg text-left text-xs font-semibold text-slate-700 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    <span>Relatório em CSV</span>
                    {user?.plan === 'free' && <Lock className="h-3 w-3 text-slate-400" />}
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="flex w-full items-center justify-between px-3.5 py-2.5 rounded-lg text-left text-xs font-semibold text-slate-700 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    <span>Relatório em Excel</span>
                    {user?.plan === 'free' && <Lock className="h-3 w-3 text-slate-400" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters Selectors Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 pt-1">
          
          {/* Text Search Input */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-450" />
            <input
              type="text"
              placeholder="Pesquisar descrição..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:text-white"
            />
          </div>

          {/* Type Filter Select */}
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:text-white dark:bg-slate-950"
          >
            <option value="all">Tipo: Todos</option>
            <option value="income">Receitas (+)</option>
            <option value="expense">Despesas (-)</option>
          </select>

          {/* Category Filter Select */}
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:text-white dark:bg-slate-950"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'Categoria: Todas' : cat}
              </option>
            ))}
          </select>

          {/* Period Filter Select */}
          <select
            value={filters.period}
            onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:text-white dark:bg-slate-950"
          >
            <option value="all">Período: Todo Histórico</option>
            <option value="current-month">Mês Atual</option>
            <option value="last-month">Mês Anterior</option>
            <option value="last-3-months">Últimos 3 Meses</option>
            <option value="current-year">Ano Atual</option>
          </select>
        </div>
      </div>

      {/* TRANSACTION TABLE */}
      <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-900 bg-slate-50/20 dark:bg-slate-900/10">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Registros Financeiros</span>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border-0 bg-transparent text-xs font-semibold text-slate-500 focus:ring-0 focus:outline-none dark:text-slate-400 cursor-pointer"
            >
              <option value="date-desc">Recentes Primeiro</option>
              <option value="date-asc">Antigos Primeiro</option>
              <option value="amount-desc">Maior Valor</option>
              <option value="amount-asc">Menor Valor</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {sortedTransactions.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/40 dark:bg-slate-900/40 text-slate-450 font-bold border-b border-slate-250/30 dark:border-slate-800">
                  <th className="p-4 pl-6">Data</th>
                  <th className="p-4">Descrição</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Valor</th>
                  <th className="p-4">Observações</th>
                  <th className="p-4 pr-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900/60">
                {sortedTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 text-slate-650 dark:text-slate-300 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-slate-450 whitespace-nowrap">
                      {new Date(tx.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4 font-bold text-slate-850 dark:text-white whitespace-nowrap">
                      {tx.descricao}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-500">
                        {tx.categoria}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        tx.tipo === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${tx.tipo === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {tx.tipo === 'income' ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                    <td className={`p-4 font-bold font-sans text-sm whitespace-nowrap ${
                      tx.tipo === 'income' ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {tx.tipo === 'income' ? '+' : '-'} R$ {tx.valor.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="p-4 text-slate-400 max-w-[150px] truncate" title={tx.observacao || ''}>
                      {tx.observacao || '-'}
                    </td>
                    <td className="p-4 pr-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleEditClick(tx)}
                          className="p-1.5 rounded-lg border border-slate-205 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(tx.id)}
                          className="p-1.5 rounded-lg border border-rose-205 dark:border-rose-950/40 text-rose-400 hover:text-rose-650 hover:bg-rose-500/10 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16 space-y-2">
              <p className="text-sm font-semibold text-slate-400">Nenhuma transação cadastrada ou correspondente aos filtros.</p>
              <p className="text-xs text-slate-500">Altere os filtros acima ou registre uma nova movimentação.</p>
            </div>
          )}
        </div>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        transaction={editingTransaction}
      />

    </div>
  );
};
