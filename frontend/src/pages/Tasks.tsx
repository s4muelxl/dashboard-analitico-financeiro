import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Task } from '../types';
import { 
  CalendarRange, 
  Plus, 
  Trash2, 
  CheckSquare, 
  Square, 
  Clock, 
  Sparkles, 
  Tag, 
  AlertCircle,
  RefreshCw,
  Loader2
} from 'lucide-react';

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  
  // New Task form state
  const [descricao, setDescricao] = useState('');
  const [horario, setHorario] = useState('08:00');
  const [categoria, setCategoria] = useState('Outros');
  const [prioridade, setPrioridade] = useState<'alta' | 'media' | 'baixa'>('media');
  const [tempoEstimado, setTempoEstimado] = useState('30');
  const [diaSemana, setDiaSemana] = useState('segunda');
  const [recorrente, setRecorrente] = useState(true);

  const DIAS_SEMANA = [
    { key: 'diario', label: 'Todos os Dias (Diário)' },
    { key: 'segunda', label: 'Segunda-feira' },
    { key: 'terca', label: 'Terça-feira' },
    { key: 'quarta', label: 'Quarta-feira' },
    { key: 'quinta', label: 'Quinta-feira' },
    { key: 'sexta', label: 'Sexta-feira' },
    { key: 'sabado', label: 'Sábado' },
    { key: 'domingo', label: 'Domingo' }
  ];

  const CATEGORIES = ['Alimentação', 'Estudos', 'Trabalho', 'Saúde', 'Desenvolvimento', 'Organização', 'Lazer', 'Outros'];

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await api.tasks.list();
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleToggle = async (id: number) => {
    try {
      const updated = await api.tasks.toggle(id);
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Deseja remover esta tarefa da sua rotina?')) return;
    try {
      await api.tasks.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handlePopulate = async () => {
    setLoading(true);
    try {
      const populated = await api.tasks.populateDefaults();
      setTasks(populated);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim()) return;

    setAddingTask(true);
    try {
      const newTask = await api.tasks.create({
        descricao,
        horario,
        categoria,
        prioridade,
        tempo_estimado: parseInt(tempoEstimado) || 30,
        recorrente,
        dia_semana: diaSemana
      });
      setTasks(prev => [...prev, newTask]);
      
      // Reset Form
      setDescricao('');
      setHorario('08:00');
      setTempoEstimado('30');
    } catch (e) {
      console.error(e);
    } finally {
      setAddingTask(false);
    }
  };

  // Group tasks by day of the week
  const getTasksByDay = (dayKey: string) => {
    return tasks
      .filter(t => t.dia_semana === dayKey)
      .sort((a, b) => a.horario.localeCompare(b.horario));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarRange className="h-6 w-6 text-blue-500" />
            Rotina Semanal & Hábitos
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Planeje suas tarefas diárias (treino, alimentação, estudos) de segunda a domingo e acompanhe suas obrigações.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePopulate}
            disabled={loading}
            className="flex h-9 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 px-4 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-all"
            title="Preencher com atividades comuns como Café, Estudos, Academia"
          >
            <Sparkles className="h-4 w-4" />
            Carregar Rotina Padrão
          </button>

          <button
            onClick={loadTasks}
            disabled={loading}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-205 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* QUICK TASK CREATOR */}
      <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Adicionar Tarefa na Agenda</h3>
        
        <form onSubmit={handleCreateTask} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5 items-end">
          {/* Description */}
          <div className="lg:col-span-2">
            <label className="text-[10px] font-bold text-slate-450 uppercase block mb-1.5">O que vai fazer?</label>
            <input
              type="text"
              placeholder="Ex: Treinar Peito, Ler Livro, Café..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:text-white"
              required
            />
          </div>

          {/* Day of Week */}
          <div>
            <label className="text-[10px] font-bold text-slate-450 uppercase block mb-1.5">Dia da Semana</label>
            <select
              value={diaSemana}
              onChange={(e) => setDiaSemana(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:text-white dark:bg-slate-950"
            >
              {DIAS_SEMANA.map(d => (
                <option key={d.key} value={d.key}>{d.label}</option>
              ))}
            </select>
          </div>

          {/* Hour */}
          <div>
            <label className="text-[10px] font-bold text-slate-450 uppercase block mb-1.5">Horário</label>
            <input
              type="time"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:text-white"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] font-bold text-slate-450 uppercase block mb-1.5">Categoria</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:text-white dark:bg-slate-950"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="text-[10px] font-bold text-slate-450 uppercase block mb-1.5">Prioridade</label>
            <select
              value={prioridade}
              onChange={(e) => setPrioridade(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:text-white dark:bg-slate-950"
            >
              <option value="alta">🔴 Alta</option>
              <option value="media">🟡 Média</option>
              <option value="baixa">🟢 Baixa</option>
            </select>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={addingTask}
              className="w-full h-9 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/10 transition-all"
            >
              {addingTask ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Adicionar
            </button>
          </div>
        </form>
      </div>

      {/* WEEKLY PLANNER GRID COLUMN-VIEW (SCROLLABLE ROW) */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-slate-105 scrollbar-thumb-slate-250 dark:scrollbar-track-slate-950 dark:scrollbar-thumb-slate-850">
        
        {DIAS_SEMANA.map((day) => {
          const dayTasks = getTasksByDay(day.key);

          return (
            <div 
              key={day.key} 
              className={`flex-none w-72 rounded-2xl p-4 border flex flex-col justify-between min-h-[420px] transition-colors
                ${day.key === 'diario' 
                  ? 'bg-blue-50/20 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900/40' 
                  : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-900'
                }
              `}
            >
              <div>
                {/* Header of the Day */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-3 mb-3">
                  <span className={`text-xs font-extrabold uppercase tracking-wider 
                    ${day.key === 'diario' ? 'text-blue-500' : 'text-slate-850 dark:text-white'}
                  `}>
                    {day.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded">
                    {dayTasks.length} {dayTasks.length === 1 ? 'tarefa' : 'tarefas'}
                  </span>
                </div>

                {/* Task items list */}
                <div className="space-y-2.5 overflow-y-auto max-h-[300px] pr-0.5">
                  {dayTasks.length > 0 ? (
                    dayTasks.map((t) => {
                      const isCompleted = t.status === 'concluido';
                      return (
                        <div 
                          key={t.id} 
                          className={`group p-2.5 rounded-xl border transition-all flex items-start justify-between gap-2.5
                            ${isCompleted 
                              ? 'bg-slate-50/50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-900/60 opacity-60' 
                              : 'bg-white dark:bg-slate-950 border-slate-200/60 dark:border-slate-850/80 hover:border-slate-305 dark:hover:border-slate-700'
                            }
                          `}
                        >
                          <div className="flex gap-2 min-w-0">
                            {/* Completion Checkbox */}
                            <button
                              onClick={() => handleToggle(t.id)}
                              className="text-slate-450 dark:text-slate-500 hover:text-blue-500 transition-colors shrink-0 mt-0.5"
                            >
                              {isCompleted ? (
                                <CheckSquare className="h-4.5 w-4.5 text-blue-500" />
                              ) : (
                                <Square className="h-4.5 w-4.5" />
                              )}
                            </button>
                            
                            <div className="min-w-0">
                              <span className={`text-xs font-semibold block leading-tight truncate
                                ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}
                              `}>
                                {t.descricao}
                              </span>
                              
                              <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[9px] text-slate-400 font-semibold">
                                <span className="flex items-center gap-0.5">
                                  <Clock className="h-2.5 w-2.5" />
                                  {t.horario}
                                </span>
                                <span>•</span>
                                <span className="capitalize">{t.categoria}</span>
                              </div>
                            </div>
                          </div>

                          {/* Delete Action button */}
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="text-slate-350 hover:text-rose-500 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            title="Excluir"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-slate-100 dark:border-slate-900 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold">Nenhum registro</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Day footer/tip */}
              {dayTasks.length > 0 && (
                <div className="text-[9px] text-slate-400 text-right mt-3 border-t border-slate-100 dark:border-slate-900 pt-2 font-medium">
                  {dayTasks.filter(t => t.status === 'concluido').length}/{dayTasks.length} concluídas
                </div>
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
};
