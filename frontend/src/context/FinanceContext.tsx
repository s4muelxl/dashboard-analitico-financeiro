import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Transaction, Goal, Task } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

interface FinanceContextType {
  transactions: Transaction[];
  goals: Goal[];
  tasks: Task[];
  loading: boolean;
  filters: {
    search: string;
    type: string;
    category: string;
    period: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    search: string;
    type: string;
    category: string;
    period: string;
  }>>;
  refreshData: () => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: number, tx: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  updateGoalProgress: (tipo: string, val: number) => Promise<void>;
  toggleTask: (id: number) => Promise<void>;
  totals: {
    income: number;
    expense: number;
    balance: number;
    savingsRate: number;
  };
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    category: 'all',
    period: 'all' // 'all' | 'current-month' | 'last-month' | 'last-3-months' | 'current-year'
  });

  const refreshData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [txData, goalData, taskData] = await Promise.all([
        api.transactions.list(filters),
        api.goals.list(),
        api.tasks.list()
      ]);
      setTransactions(txData);
      setGoals(goalData);
      setTasks(taskData);
    } catch (error) {
      console.error('Failed to load financial data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  // Refresh whenever filters or user session change
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    try {
      const newTx = await api.transactions.create(tx);
      setTransactions(prev => [newTx, ...prev]);
      
      // If it's a savings/income transaction, trigger celebratory confetti!
      if (tx.tipo === 'income' && tx.valor >= 1000) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 }
        });
      }
      
      // Refresh to update potential goals / budget calculations
      await refreshData();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const updateTransaction = async (id: number, tx: Omit<Transaction, 'id'>) => {
    try {
      const updatedTx = await api.transactions.update(id, tx);
      setTransactions(prev => prev.map(t => t.id === id ? updatedTx : t));
      await refreshData();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const deleteTransaction = async (id: number) => {
    try {
      await api.transactions.delete(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      await refreshData();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const updateGoalProgress = async (tipo: string, val: number) => {
    try {
      const updatedGoal = await api.goals.updateProgress(tipo, val);
      setGoals(prev => prev.map(g => g.tipo === tipo ? updatedGoal : g));
      
      // Check if goal was just reached/completed
      if (updatedGoal.progresso_valor >= updatedGoal.meta_valor) {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTask = async (id: number) => {
    try {
      const updatedTask = await api.tasks.toggle(id);
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
    } catch (e) {
      console.error(e);
    }
  };

  // Calculate totals
  const totals = React.useMemo(() => {
    let income = 0;
    let expense = 0;
    
    transactions.forEach(t => {
      if (t.tipo === 'income') {
        income += t.valor;
      } else {
        expense += t.valor;
      }
    });

    const balance = income - expense;
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

    return {
      income,
      expense,
      balance,
      savingsRate: Math.max(-100, Math.min(100, savingsRate))
    };
  }, [transactions]);

  return (
    <FinanceContext.Provider value={{
      transactions,
      goals,
      tasks,
      loading,
      filters,
      setFilters,
      refreshData,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      updateGoalProgress,
      toggleTask,
      totals
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
