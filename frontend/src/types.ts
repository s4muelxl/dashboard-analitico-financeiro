export interface User {
  id: number;
  nome: string;
  email: string;
  cargo: 'admin' | 'comum';
  plan: 'free' | 'premium' | 'enterprise';
  status: 'ativo' | 'bloqueado';
  data_criacao?: string;
  ultimo_acesso?: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: number;
  user_id?: number;
  descricao: string;
  description?: string; // alias
  categoria: string;
  category?: string; // alias
  valor: number;
  amount?: number; // alias
  tipo: TransactionType;
  type?: TransactionType; // alias
  data: string;
  date?: string; // alias
  observacao?: string;
}

export interface Goal {
  id: number;
  user_id?: number;
  tipo: string; // 'agua' | 'estudos' | 'exercicios' | 'horas_trabalhadas' | 'economia_dia' | 'poupanca_mensal'
  meta_valor: number;
  progresso_valor: number;
  data: string;
}

export interface Task {
  id: number;
  descricao: string;
  horario: string;
  categoria: string;
  prioridade: 'baixa' | 'media' | 'alta';
  status: 'pendente' | 'concluido';
  tempo_estimado: number;
  recorrente: boolean;
  dia_semana: string;
}

export interface PlanDetails {
  id: 'free' | 'premium' | 'enterprise';
  name: string;
  price: string;
  period: string;
  features: string[];
  limitations: string[];
  maxTransactions: number;
}
