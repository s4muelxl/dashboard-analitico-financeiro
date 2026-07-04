import React from 'react';
import { ArrowUpRight, ArrowDownRight, Percent } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext: string;
  type: 'income' | 'expense' | 'balance' | 'percentage';
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtext, type, icon }) => {
  const getCardStyles = () => {
    switch (type) {
      case 'income':
        return {
          border: 'border-emerald-500/10 dark:border-emerald-500/15',
          trendColor: 'text-emerald-500',
          bgGlow: 'bg-emerald-500/5',
          valueColor: 'text-emerald-600 dark:text-emerald-400',
          glowClass: 'glow-card-income'
        };
      case 'expense':
        return {
          border: 'border-rose-500/10 dark:border-rose-500/15',
          trendColor: 'text-rose-500',
          bgGlow: 'bg-rose-500/5',
          valueColor: 'text-rose-600 dark:text-rose-400',
          glowClass: 'glow-card-expense'
        };
      case 'balance':
        return {
          border: 'border-blue-500/10 dark:border-blue-500/15',
          trendColor: 'text-blue-500',
          bgGlow: 'bg-blue-500/5',
          valueColor: 'text-blue-600 dark:text-blue-400',
          glowClass: 'glow-card-balance'
        };
      default:
        return {
          border: 'border-violet-500/10 dark:border-violet-500/15',
          trendColor: 'text-violet-500',
          bgGlow: 'bg-violet-500/5',
          valueColor: 'text-violet-600 dark:text-violet-400',
          glowClass: 'glow-card-balance'
        };
    }
  };

  const styles = getCardStyles();

  return (
    <div className={`glass-card p-6 rounded-2xl border ${styles.border} ${styles.glowClass} flex justify-between items-start relative overflow-hidden group`}>
      {/* Background glow hover effect */}
      <div className={`absolute inset-0 ${styles.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      <div className="relative z-10 flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{title}</p>
        <h3 className={`text-2xl font-bold tracking-tight mt-2.5 font-sans truncate ${styles.valueColor}`}>
          {value}
        </h3>
        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
          {type === 'income' && <ArrowUpRight className="h-3 w-3 text-emerald-500 shrink-0" />}
          {type === 'expense' && <ArrowDownRight className="h-3 w-3 text-rose-500 shrink-0" />}
          {type === 'balance' && <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />}
          {type === 'percentage' && <Percent className="h-3 w-3 text-violet-500 shrink-0" />}
          {subtext}
        </p>
      </div>

      <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
    </div>
  );
};
