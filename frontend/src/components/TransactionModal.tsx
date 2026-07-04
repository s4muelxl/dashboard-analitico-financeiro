import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';
import { X, Calendar, DollarSign, FileText, Tag, HelpCircle, ChevronDown } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tx: {
    descricao: string;
    categoria: string;
    valor: number;
    tipo: TransactionType;
    data: string;
    observacao?: string;
  }) => Promise<void>;
  transaction?: Transaction | null;
}

const INCOME_CATEGORIES = ['Salário', 'Freelance', 'Investimentos', 'Outros'];
const EXPENSE_CATEGORIES = ['Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Assinaturas', 'Outros'];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  transaction
}) => {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<TransactionType>('income');
  const [categoria, setCategoria] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [observacao, setObservacao] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Initialize fields when opening/editing
  useEffect(() => {
    if (transaction) {
      setDescricao(transaction.descricao);
      setValor(String(transaction.valor));
      setTipo(transaction.tipo);
      setCategoria(transaction.categoria);
      setData(transaction.data ? transaction.data.split('T')[0] : '');
      setObservacao(transaction.observacao || '');
    } else {
      setDescricao('');
      setValor('');
      setTipo('income');
      setCategoria(INCOME_CATEGORIES[0]);
      setData(new Date().toISOString().split('T')[0]);
      setObservacao('');
    }
    setError('');
  }, [transaction, isOpen]);

  // Adjust categories list on type change
  useEffect(() => {
    if (!transaction) {
      setCategoria(tipo === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
    }
  }, [tipo, transaction]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!descricao.trim()) return setError('Insira uma descrição válida.');
    const parsedValor = parseFloat(valor);
    if (isNaN(parsedValor) || parsedValor <= 0) return setError('O valor precisa ser maior que zero.');
    if (!categoria) return setError('Selecione uma categoria.');
    if (!data) return setError('Selecione uma data.');

    setSubmitting(true);
    try {
      await onSubmit({
        descricao: descricao.trim(),
        categoria,
        valor: parsedValor,
        tipo,
        data,
        observacao: observacao.trim() || undefined
      });
      onClose();
    } catch (e: any) {
      setError(e.message || 'Erro ao processar transação.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-955 p-6 shadow-xl border border-slate-205 dark:border-slate-850 animate-slide-up relative z-50">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {transaction ? 'Editar Transação' : 'Nova Transação'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 p-3 text-sm text-rose-500 font-medium border border-rose-100 dark:border-rose-900/40">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Tipo Selector Toggle */}
          <div className="grid grid-cols-2 gap-2.5 p-1 bg-slate-105 dark:bg-slate-900 rounded-xl">
            <button
              type="button"
              onClick={() => setTipo('income')}
              className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                tipo === 'income'
                  ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
              }`}
            >
              Receita (+)
            </button>
            <button
              type="button"
              onClick={() => setTipo('expense')}
              className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                tipo === 'expense'
                  ? 'bg-white dark:bg-slate-800 text-rose-500 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
              }`}
            >
              Despesa (-)
            </button>
          </div>

          {/* Descricao */}
          <div>
            <label className="text-xs font-semibold text-slate-405 uppercase tracking-wider block mb-1.5">Descrição</label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Ex: Supermercado Assaí, Freelance Landing Page"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:text-white"
                required
              />
            </div>
          </div>

          {/* Valor & Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-405 uppercase tracking-wider block mb-1.5">Valor (R$)</label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-405 uppercase tracking-wider block mb-1.5">Data</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="text-xs font-semibold text-slate-405 uppercase tracking-wider block mb-1.5">Categoria</label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:text-white appearance-none"
              >
                {(tipo === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                  <option key={cat} value={cat} className="dark:bg-slate-950 dark:text-white">
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-3.5 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Observacao */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Observação (Opcional)</label>
            <div className="relative">
              <HelpCircle className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              <textarea
                placeholder="Detalhes adicionais..."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                rows={2}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:text-white resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-900 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-350 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all ${
                submitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? 'Salvando...' : transaction ? 'Atualizar' : 'Salvar'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
