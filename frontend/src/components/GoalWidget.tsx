import React from 'react';
import { Goal } from '../types';
import { Plus, Minus, Trophy, Droplet, Dumbbell, Award, Flame, Wallet } from 'lucide-react';

interface GoalWidgetProps {
  goals: Goal[];
  onUpdateProgress: (tipo: string, val: number) => Promise<void>;
}

export const GoalWidget: React.FC<GoalWidgetProps> = ({ goals, onUpdateProgress }) => {
  const getGoalMetadata = (tipo: string) => {
    switch (tipo) {
      case 'agua':
        return {
          title: 'Hidratação Diária',
          icon: <Droplet className="h-5 w-5 text-blue-500" />,
          unit: 'ml',
          step: 250,
          color: 'from-blue-500 to-sky-450'
        };
      case 'estudos':
        return {
          title: 'Estudo de Finanças',
          icon: <Award className="h-5 w-5 text-amber-500" />,
          unit: 'min',
          step: 15,
          color: 'from-amber-500 to-yellow-400'
        };
      case 'exercicios':
        return {
          title: 'Exercício Físico',
          icon: <Dumbbell className="h-5 w-5 text-emerald-500" />,
          unit: 'min',
          step: 10,
          color: 'from-emerald-500 to-teal-400'
        };
      case 'horas_trabalhadas':
        return {
          title: 'Foco no Trabalho',
          icon: <Flame className="h-5 w-5 text-orange-500" />,
          unit: 'min',
          step: 30,
          color: 'from-orange-500 to-red-400'
        };
      default:
        return {
          title: 'Economia do Dia',
          icon: <Wallet className="h-5 w-5 text-purple-500" />,
          unit: 'R$',
          step: 5,
          color: 'from-purple-500 to-pink-400'
        };
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500 animate-pulse-subtle" />
            Metas do Dia & Hábitos
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Acompanhe e registre sua produtividade diária</p>
        </div>
      </div>

      <div className="space-y-5">
        {goals.map((goal) => {
          const meta = getGoalMetadata(goal.tipo);
          const percent = Math.min(100, Math.round((goal.progresso_valor / goal.meta_valor) * 100));
          const isDone = percent >= 100;

          return (
            <div key={goal.id} className="space-y-2 border-b border-slate-100 dark:border-slate-900 last:border-0 pb-4 last:pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
                    {meta.icon}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">{meta.title}</span>
                    <span className="text-xs text-slate-400">
                      {goal.progresso_valor} / {goal.meta_valor} {meta.unit}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateProgress(goal.tipo, -meta.step)}
                    className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-250 dark:border-slate-800 text-slate-400 dark:text-slate-550 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    title="Diminuir progresso"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onUpdateProgress(goal.tipo, meta.step)}
                    className={`h-7 w-7 flex items-center justify-center rounded-lg text-white transition-all shadow-sm ${
                      isDone
                        ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-emerald-550/15'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/15'
                    }`}
                    title="Aumentar progresso"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-100/50 dark:border-slate-900/40">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${meta.color} transition-all duration-550`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold px-0.5">
                  <span>Progresso</span>
                  <span className={isDone ? 'text-emerald-500 font-bold' : ''}>
                    {percent}% {isDone && '✓'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
