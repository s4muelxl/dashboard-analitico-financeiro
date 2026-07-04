import { User, Transaction, Goal, Task } from '../types';

// Detect or initialize Mock Mode setting (defaults to true for zero-setup preview)
const MOCK_STORAGE_KEY = 'sf_mock_mode';
if (localStorage.getItem(MOCK_STORAGE_KEY) === null) {
  localStorage.setItem(MOCK_STORAGE_KEY, 'true');
}

export const isMockMode = (): boolean => {
  return localStorage.getItem(MOCK_STORAGE_KEY) === 'true';
};

export const setMockMode = (value: boolean) => {
  localStorage.setItem(MOCK_STORAGE_KEY, String(value));
  window.location.reload();
};

// --- INITIAL MOCK SEED DATA ---
const defaultUser: User = {
  id: 1,
  nome: 'Lucas Silva',
  email: 'lucas@exemplo.com',
  cargo: 'comum',
  plan: 'premium',
  status: 'ativo',
  data_criacao: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  ultimo_acesso: new Date().toISOString()
};

const defaultAdmin: User = {
  id: 99,
  nome: 'Administrador Strong',
  email: 'admin@strongfinance.com',
  cargo: 'admin',
  plan: 'enterprise',
  status: 'ativo',
  data_criacao: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
  ultimo_acesso: new Date().toISOString()
};

// Helper for dates relative to today
const getRelativeDateString = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const defaultTransactions: Transaction[] = [
  // Receitas (Incomes)
  { id: 1, descricao: 'Salário Principal', categoria: 'Salário', valor: 8500.00, tipo: 'income', data: getRelativeDateString(18), observacao: 'Salário CLT mensal' },
  { id: 2, descricao: 'Projeto Freelance React', categoria: 'Freelance', valor: 2800.00, tipo: 'income', data: getRelativeDateString(12), observacao: 'Desenvolvimento de Landing Page' },
  { id: 3, descricao: 'Dividendos Ações', categoria: 'Investimentos', valor: 420.50, tipo: 'income', data: getRelativeDateString(5), observacao: 'FIIs e Ações' },
  
  // Despesas (Expenses)
  { id: 4, descricao: 'Aluguel do Apartamento', categoria: 'Moradia', valor: 2200.00, tipo: 'expense', data: getRelativeDateString(17), observacao: 'Aluguel + Condomínio' },
  { id: 5, descricao: 'Supermercado Mensal', categoria: 'Alimentação', valor: 850.30, tipo: 'expense', data: getRelativeDateString(14), observacao: 'Compras do mês' },
  { id: 6, descricao: 'Jantar Restaurante Gourmet', categoria: 'Lazer', valor: 320.00, tipo: 'expense', data: getRelativeDateString(10), observacao: 'Comemoração' },
  { id: 7, descricao: 'Gasolina Carro', categoria: 'Transporte', valor: 240.00, tipo: 'expense', data: getRelativeDateString(8), observacao: 'Posto Shell' },
  { id: 8, descricao: 'Mensalidade Academia', categoria: 'Saúde', valor: 149.90, tipo: 'expense', data: getRelativeDateString(6), observacao: 'Plano Black' },
  { id: 9, descricao: 'Assinatura Netflix & Spotify', categoria: 'Assinaturas', valor: 89.90, tipo: 'expense', data: getRelativeDateString(4), observacao: 'Débito Automático' },
  { id: 10, descricao: 'Farmácia de Cuidado Diário', categoria: 'Saúde', valor: 112.50, tipo: 'expense', data: getRelativeDateString(2), observacao: 'Remédios e Vitaminas' },
  { id: 11, descricao: 'Uber Trabalho', categoria: 'Transporte', valor: 45.00, tipo: 'expense', data: getRelativeDateString(1), observacao: 'Corrida corporativa' },
  
  // Historical seed data for earlier months to build gorgeous charts
  { id: 101, descricao: 'Salário Principal', categoria: 'Salário', valor: 8500.00, tipo: 'income', data: '2026-05-05', observacao: 'CLT' },
  { id: 102, descricao: 'Consultoria Backend', categoria: 'Freelance', valor: 1500.00, tipo: 'income', data: '2026-05-15' },
  { id: 103, descricao: 'Aluguel', categoria: 'Moradia', valor: 2200.00, tipo: 'expense', data: '2026-05-05' },
  { id: 104, descricao: 'Supermercado', categoria: 'Alimentação', valor: 780.00, tipo: 'expense', data: '2026-05-07' },
  { id: 105, descricao: 'Lazer & Cinema', categoria: 'Lazer', valor: 280.00, tipo: 'expense', data: '2026-05-20' },

  { id: 201, descricao: 'Salário Principal', categoria: 'Salário', valor: 8500.00, tipo: 'income', data: '2026-04-05' },
  { id: 202, descricao: 'Venda de Notebook Usado', categoria: 'Outros', valor: 2000.00, tipo: 'income', data: '2026-04-12' },
  { id: 203, descricao: 'Aluguel', categoria: 'Moradia', valor: 2200.00, tipo: 'expense', data: '2026-04-05' },
  { id: 204, descricao: 'Supermercado', categoria: 'Alimentação', valor: 920.00, tipo: 'expense', data: '2026-04-08' },
  { id: 205, descricao: 'Conserto do Carro', categoria: 'Transporte', valor: 1200.00, tipo: 'expense', data: '2026-04-15' },

  { id: 301, descricao: 'Salário Principal', categoria: 'Salário', valor: 8000.00, tipo: 'income', data: '2026-03-05' },
  { id: 303, descricao: 'Aluguel', categoria: 'Moradia', valor: 2200.00, tipo: 'expense', data: '2026-03-05' },
  { id: 304, descricao: 'Supermercado', categoria: 'Alimentação', valor: 650.00, tipo: 'expense', data: '2026-03-07' },
];

const defaultGoals: Goal[] = [
  { id: 1, tipo: 'agua', meta_valor: 2000, progresso_valor: 1250, data: getRelativeDateString(0) },
  { id: 2, tipo: 'estudos', meta_valor: 120, progresso_valor: 90, data: getRelativeDateString(0) },
  { id: 3, tipo: 'exercicios', meta_valor: 30, progresso_valor: 45, data: getRelativeDateString(0) },
  { id: 4, tipo: 'horas_trabalhadas', meta_valor: 480, progresso_valor: 360, data: getRelativeDateString(0) },
  { id: 5, tipo: 'economia_dia', meta_valor: 30, progresso_valor: 25, data: getRelativeDateString(0) }
];

const defaultTasks: Task[] = [
  { id: 1, descricao: 'Revisar orçamento mensal', horario: '09:00', categoria: 'Finanças', prioridade: 'alta', status: 'pendente', tempo_estimado: 30, recorrente: false, dia_semana: 'segunda' },
  { id: 2, descricao: 'Treino de Pernas (Academia)', horario: '18:30', categoria: 'Saúde', prioridade: 'media', status: 'concluido', tempo_estimado: 60, recorrente: true, dia_semana: 'diario' },
  { id: 3, descricao: 'Curso de Finanças Corporativas', horario: '20:30', categoria: 'Estudos', prioridade: 'baixa', status: 'pendente', tempo_estimado: 45, recorrente: true, dia_semana: 'terca' },
];

// Initialize LocalStorage with seeds if empty
const initializeMockDb = () => {
  if (!localStorage.getItem('sf_users')) {
    localStorage.setItem('sf_users', JSON.stringify([defaultUser, defaultAdmin]));
  }
  if (!localStorage.getItem('sf_transactions')) {
    localStorage.setItem('sf_transactions', JSON.stringify(defaultTransactions));
  }
  if (!localStorage.getItem('sf_goals')) {
    localStorage.setItem('sf_goals', JSON.stringify(defaultGoals));
  }
  if (!localStorage.getItem('sf_tasks')) {
    localStorage.setItem('sf_tasks', JSON.stringify(defaultTasks));
  }
};
initializeMockDb();

// Generic API response helper
const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Erro de rede: ${res.status}`);
  }
  return res.json();
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('sf_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // --- AUTHENTICATION ---
  auth: {
    login: async (email: string, password?: string): Promise<{ token: string, user: User }> => {
      if (isMockMode()) {
        const users: User[] = JSON.parse(localStorage.getItem('sf_users') || '[]');
        const user = users.find(u => u.email === email);
        if (!user) {
          throw new Error('E-mail ou senha incorretos (Simulado).');
        }
        if (password === 'fail') {
          throw new Error('Senha incorreta (Simulado).');
        }
        const token = `mock_token_${user.id}_${Date.now()}`;
        localStorage.setItem('sf_token', token);
        localStorage.setItem('sf_current_user', JSON.stringify(user));
        return { token, user };
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await handleResponse(res);
        localStorage.setItem('sf_token', data.token);
        // Map backend schema to UI schema
        const uiUser: User = {
          id: data.user.id,
          nome: data.user.nome,
          email: data.user.email,
          cargo: data.user.cargo,
          plan: data.user.plan || 'free', // support mock subscription plan
          status: 'ativo'
        };
        localStorage.setItem('sf_current_user', JSON.stringify(uiUser));
        return { token: data.token, user: uiUser };
      }
    },

    register: async (nome: string, email: string, password?: string): Promise<{ token: string, user: User }> => {
      if (isMockMode()) {
        const users: User[] = JSON.parse(localStorage.getItem('sf_users') || '[]');
        if (users.some(u => u.email === email)) {
          throw new Error('Este e-mail já está cadastrado.');
        }
        const newUser: User = {
          id: users.length + 10,
          nome,
          email,
          cargo: 'comum',
          plan: 'free',
          status: 'ativo',
          data_criacao: new Date().toISOString()
        };
        users.push(newUser);
        localStorage.setItem('sf_users', JSON.stringify(users));
        const token = `mock_token_${newUser.id}_${Date.now()}`;
        localStorage.setItem('sf_token', token);
        localStorage.setItem('sf_current_user', JSON.stringify(newUser));
        return { token, user: newUser };
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, email, password })
        });
        const data = await handleResponse(res);
        localStorage.setItem('sf_token', data.token);
        const uiUser: User = {
          id: data.user.id,
          nome: data.user.nome,
          email: data.user.email,
          cargo: data.user.cargo,
          plan: 'free',
          status: 'ativo'
        };
        localStorage.setItem('sf_current_user', JSON.stringify(uiUser));
        return { token: data.token, user: uiUser };
      }
    },

    getMe: async (): Promise<User> => {
      if (isMockMode()) {
        const cached = localStorage.getItem('sf_current_user');
        if (!cached) throw new Error('Não autenticado.');
        return JSON.parse(cached);
      } else {
        const res = await fetch('/api/auth/me', { headers: getAuthHeaders() });
        const user = await handleResponse(res);
        const uiUser: User = {
          id: user.id,
          nome: user.nome,
          email: user.email,
          cargo: user.cargo,
          plan: user.plan || 'free',
          status: user.status
        };
        localStorage.setItem('sf_current_user', JSON.stringify(uiUser));
        return uiUser;
      }
    },

    updatePlan: async (plan: 'free' | 'premium' | 'enterprise'): Promise<User> => {
      const cached = localStorage.getItem('sf_current_user');
      if (!cached) throw new Error('Não autenticado.');
      const user: User = JSON.parse(cached);
      user.plan = plan;
      
      if (isMockMode()) {
        const users: User[] = JSON.parse(localStorage.getItem('sf_users') || '[]');
        const updatedUsers = users.map(u => u.id === user.id ? { ...u, plan } : u);
        localStorage.setItem('sf_users', JSON.stringify(updatedUsers));
        localStorage.setItem('sf_current_user', JSON.stringify(user));
        return user;
      } else {
        // If they upgrade plan, we update the local representation. In full SaaS, this would hit Stripe/Stripe billing endpoints.
        localStorage.setItem('sf_current_user', JSON.stringify(user));
        // Simple endpoint request simulation if it exists, otherwise just return local update
        try {
          await fetch('/api/auth/plan', {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ plan })
          });
        } catch (e) {
          console.warn('Real backend has no plan upgrade API yet, handled in frontend state.');
        }
        return user;
      }
    },

    logout: async (): Promise<void> => {
      if (!isMockMode()) {
        try {
          await fetch('/api/auth/logout', { method: 'POST', headers: getAuthHeaders() });
        } catch (e) {
          console.error('Erro no logout backend:', e);
        }
      }
      localStorage.removeItem('sf_token');
      localStorage.removeItem('sf_current_user');
    }
  },

  // --- TRANSACTIONS ---
  transactions: {
    list: async (filters?: { search?: string; type?: string; category?: string; period?: string }): Promise<Transaction[]> => {
      if (isMockMode()) {
        let list: Transaction[] = JSON.parse(localStorage.getItem('sf_transactions') || '[]');
        
        // Filter by user (mock runs in single-user demo context)
        const userStr = localStorage.getItem('sf_current_user');
        const user = userStr ? JSON.parse(userStr) : null;
        const currentUserId = user ? user.id : 1;
        
        // If standard user, filter out admin logs or other transactions
        // (Just showing all transactions seeded for simplicity, or relative to currentUser)

        if (filters?.search) {
          list = list.filter(t => t.descricao.toLowerCase().includes(filters.search!.toLowerCase()));
        }
        if (filters?.type && filters.type !== 'all') {
          list = list.filter(t => t.tipo === filters.type);
        }
        if (filters?.category && filters.category !== 'all') {
          list = list.filter(t => t.categoria === filters.category);
        }
        if (filters?.period && filters.period !== 'all') {
          const today = new Date();
          const currentYear = today.getFullYear();
          const currentMonth = today.getMonth(); // 0-11

          list = list.filter(t => {
            const txDate = new Date(t.data);
            const txYear = txDate.getFullYear();
            const txMonth = txDate.getMonth();

            if (filters.period === 'current-month') {
              return txYear === currentYear && txMonth === currentMonth;
            } else if (filters.period === 'last-month') {
              const lm = currentMonth === 0 ? 11 : currentMonth - 1;
              const ly = currentMonth === 0 ? currentYear - 1 : currentYear;
              return txYear === ly && txMonth === lm;
            } else if (filters.period === 'last-3-months') {
              const threeMonthsAgo = new Date();
              threeMonthsAgo.setMonth(today.getMonth() - 3);
              return txDate >= threeMonthsAgo;
            } else if (filters.period === 'current-year') {
              return txYear === currentYear;
            }
            return true;
          });
        }

        // Sort descending by date
        return list.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      } else {
        const queryParams = new URLSearchParams();
        if (filters?.search) queryParams.append('search', filters.search);
        if (filters?.type) queryParams.append('type', filters.type);
        if (filters?.category) queryParams.append('category', filters.category);
        if (filters?.period) queryParams.append('period', filters.period);

        const res = await fetch(`/api/transactions?${queryParams.toString()}`, { headers: getAuthHeaders() });
        const data = await handleResponse(res);
        // Map backend keys (descricao, valor, tipo, data)
        return data.map((t: any) => ({
          id: t.id,
          descricao: t.descricao || t.description,
          categoria: t.categoria || t.category,
          valor: parseFloat(t.valor || t.amount || 0),
          tipo: t.tipo || t.type,
          data: t.data || t.date,
          observacao: t.observacao
        }));
      }
    },

    create: async (tx: Omit<Transaction, 'id'>): Promise<Transaction> => {
      // Free plan transaction count validation
      const userStr = localStorage.getItem('sf_current_user');
      const user: User = userStr ? JSON.parse(userStr) : null;
      if (user && user.plan === 'free') {
        const txs = await api.transactions.list();
        const currentMonthTxs = txs.filter(t => {
          const date = new Date(t.data);
          const now = new Date();
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        });
        if (currentMonthTxs.length >= 10) {
          throw new Error('Limite do plano gratuito atingido (máximo de 10 transações por mês). Faça upgrade para o plano Premium para cadastros ilimitados!');
        }
      }

      if (isMockMode()) {
        const list: Transaction[] = JSON.parse(localStorage.getItem('sf_transactions') || '[]');
        const newTx: Transaction = {
          ...tx,
          id: list.length > 0 ? Math.max(...list.map(t => t.id)) + 1 : 1
        };
        list.push(newTx);
        localStorage.setItem('sf_transactions', JSON.stringify(list));
        return newTx;
      } else {
        const res = await fetch('/api/transactions', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(tx)
        });
        const data = await handleResponse(res);
        return {
          id: data.id,
          descricao: data.descricao,
          categoria: data.categoria,
          valor: parseFloat(data.valor),
          tipo: data.tipo,
          data: data.data,
          observacao: data.observacao
        };
      }
    },

    update: async (id: number, tx: Omit<Transaction, 'id'>): Promise<Transaction> => {
      if (isMockMode()) {
        const list: Transaction[] = JSON.parse(localStorage.getItem('sf_transactions') || '[]');
        const idx = list.findIndex(t => t.id === id);
        if (idx === -1) throw new Error('Transação não encontrada.');
        
        const updatedTx = { ...tx, id };
        list[idx] = updatedTx;
        localStorage.setItem('sf_transactions', JSON.stringify(list));
        return updatedTx;
      } else {
        const res = await fetch(`/api/transactions/${id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(tx)
        });
        const data = await handleResponse(res);
        return {
          id: data.id,
          descricao: data.descricao,
          categoria: data.categoria,
          valor: parseFloat(data.valor),
          tipo: data.tipo,
          data: data.data,
          observacao: data.observacao
        };
      }
    },

    delete: async (id: number): Promise<void> => {
      if (isMockMode()) {
        const list: Transaction[] = JSON.parse(localStorage.getItem('sf_transactions') || '[]');
        const filtered = list.filter(t => t.id !== id);
        localStorage.setItem('sf_transactions', JSON.stringify(filtered));
      } else {
        const res = await fetch(`/api/transactions/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        await handleResponse(res);
      }
    }
  },

  // --- GOALS ---
  goals: {
    list: async (): Promise<Goal[]> => {
      if (isMockMode()) {
        return JSON.parse(localStorage.getItem('sf_goals') || '[]');
      } else {
        // Simple fetch fallback if custom goal API is available.
        try {
          const res = await fetch('/api/goals', { headers: getAuthHeaders() });
          const data = await handleResponse(res);
          return data;
        } catch (e) {
          // If endpoint fails, return mock state or empty array
          return JSON.parse(localStorage.getItem('sf_goals') || '[]');
        }
      }
    },

    updateProgress: async (tipo: string, val: number): Promise<Goal> => {
      if (isMockMode()) {
        const list: Goal[] = JSON.parse(localStorage.getItem('sf_goals') || '[]');
        const idx = list.findIndex(g => g.tipo === tipo);
        if (idx === -1) {
          const newGoal: Goal = {
            id: list.length + 1,
            tipo,
            meta_valor: tipo === 'agua' ? 2000 : 100,
            progresso_valor: val,
            data: getRelativeDateString(0)
          };
          list.push(newGoal);
          localStorage.setItem('sf_goals', JSON.stringify(list));
          return newGoal;
        }
        list[idx].progresso_valor = Math.max(0, list[idx].progresso_valor + val);
        localStorage.setItem('sf_goals', JSON.stringify(list));
        return list[idx];
      } else {
        // Call backend API, fallback to mock if goals endpoint not fully configured
        try {
          const res = await fetch(`/api/goals/${tipo}/progress`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ valor: val })
          });
          return await handleResponse(res);
        } catch (e) {
          // Fallback locally
          const list: Goal[] = JSON.parse(localStorage.getItem('sf_goals') || '[]');
          const idx = list.findIndex(g => g.tipo === tipo);
          if (idx !== -1) {
            list[idx].progresso_valor += val;
            localStorage.setItem('sf_goals', JSON.stringify(list));
            return list[idx];
          }
          throw e;
        }
      }
    }
  },

  // --- TASKS ---
  tasks: {
    list: async (): Promise<Task[]> => {
      if (isMockMode()) {
        return JSON.parse(localStorage.getItem('sf_tasks') || '[]');
      } else {
        try {
          const res = await fetch('/api/tasks', { headers: getAuthHeaders() });
          const data = await handleResponse(res);
          return data.map((t: any) => ({
            id: t.id,
            descricao: t.descricao,
            horario: t.horario ? t.horario.substring(0, 5) : '', // Format TIME hh:mm:ss to hh:mm
            categoria: t.categoria,
            prioridade: t.prioridade,
            status: t.status === 'concluida' || t.status === 'concluido' ? 'concluido' : 'pendente',
            tempo_estimado: t.tempo_estimado,
            recorrente: !!t.recorrente,
            dia_semana: t.dia_semana
          }));
        } catch (e) {
          return JSON.parse(localStorage.getItem('sf_tasks') || '[]');
        }
      }
    },

    create: async (task: Omit<Task, 'id' | 'status'>): Promise<Task> => {
      if (isMockMode()) {
        const list: Task[] = JSON.parse(localStorage.getItem('sf_tasks') || '[]');
        const newTask: Task = {
          ...task,
          id: list.length > 0 ? Math.max(...list.map(t => t.id)) + 1 : 1,
          status: 'pendente'
        };
        list.push(newTask);
        localStorage.setItem('sf_tasks', JSON.stringify(list));
        return newTask;
      } else {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(task)
        });
        const data = await handleResponse(res);
        return {
          id: data.id,
          descricao: data.descricao,
          horario: data.horario ? data.horario.substring(0, 5) : '',
          categoria: data.categoria,
          prioridade: data.prioridade,
          status: 'pendente',
          tempo_estimado: data.tempo_estimado,
          recorrente: !!data.recorrente,
          dia_semana: data.dia_semana
        };
      }
    },

    delete: async (id: number): Promise<void> => {
      if (isMockMode()) {
        const list: Task[] = JSON.parse(localStorage.getItem('sf_tasks') || '[]');
        const filtered = list.filter(t => t.id !== id);
        localStorage.setItem('sf_tasks', JSON.stringify(filtered));
      } else {
        const res = await fetch(`/api/tasks/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        await handleResponse(res);
      }
    },

    toggle: async (id: number): Promise<Task> => {
      const list: Task[] = JSON.parse(localStorage.getItem('sf_tasks') || '[]');
      const idx = list.findIndex(t => t.id === id);
      if (idx === -1) throw new Error('Tarefa não encontrada.');
      const oldStatus = list[idx].status;
      const newStatus = oldStatus === 'pendente' ? 'concluido' : 'pendente';
      list[idx].status = newStatus;
      localStorage.setItem('sf_tasks', JSON.stringify(list));

      if (!isMockMode()) {
        try {
          const res = await fetch(`/api/tasks/${id}/toggle`, {
            method: 'PATCH',
            headers: getAuthHeaders()
          });
          const data = await handleResponse(res);
          list[idx].status = data.status === 'concluida' ? 'concluido' : 'pendente';
          localStorage.setItem('sf_tasks', JSON.stringify(list));
        } catch (e) {
          console.warn('Erro ao alternar tarefa no backend:', e);
        }
      }
      return list[idx];
    },

    populateDefaults: async (): Promise<Task[]> => {
      if (isMockMode()) {
        const defaultRoutine: Task[] = [
          { id: 1, descricao: 'Café da manhã nutritivo', horario: '07:30', categoria: 'Alimentação', prioridade: 'media', tempo_estimado: 30, recorrente: true, dia_semana: 'diario', status: 'pendente' },
          { id: 2, descricao: 'Estudo de Finanças & Tecnologia', horario: '08:30', categoria: 'Estudos', prioridade: 'alta', tempo_estimado: 120, recorrente: true, dia_semana: 'diario', status: 'pendente' },
          { id: 3, descricao: 'Trabalho / Projetos Core', horario: '13:00', categoria: 'Trabalho', prioridade: 'alta', tempo_estimado: 240, recorrente: true, dia_semana: 'diario', status: 'pendente' },
          { id: 4, descricao: 'Academia / Treino Físico', horario: '18:00', categoria: 'Saúde', prioridade: 'media', tempo_estimado: 90, recorrente: true, dia_semana: 'diario', status: 'pendente' },
          { id: 5, descricao: 'Leitura de Livros', horario: '21:00', categoria: 'Estudos', prioridade: 'baixa', tempo_estimado: 30, recorrente: true, dia_semana: 'diario', status: 'pendente' },
          { id: 6, descricao: 'Organizar agenda do dia seguinte', horario: '22:00', categoria: 'Organização', prioridade: 'media', tempo_estimado: 15, recorrente: true, dia_semana: 'diario', status: 'pendente' }
        ];
        localStorage.setItem('sf_tasks', JSON.stringify(defaultRoutine));
        return defaultRoutine;
      } else {
        const res = await fetch('/api/tasks/populate-defaults', {
          method: 'POST',
          headers: getAuthHeaders()
        });
        await handleResponse(res);
        // Carrega tarefas atualizadas após popular
        const listRes = await fetch('/api/tasks', { headers: getAuthHeaders() });
        const listData = await handleResponse(listRes);
        return listData.map((t: any) => ({
          id: t.id,
          descricao: t.descricao,
          horario: t.horario ? t.horario.substring(0, 5) : '',
          categoria: t.categoria,
          prioridade: t.prioridade,
          status: t.status === 'concluida' || t.status === 'concluido' ? 'concluido' : 'pendente',
          tempo_estimado: t.tempo_estimado,
          recorrente: !!t.recorrente,
          dia_semana: t.dia_semana
        }));
      }
    }
  },

  // --- PDF & EXCEL REPORTS DOWNLOAD ---
  reports: {
    downloadPdfUrl: (filters: { period: string; type: string; category: string }) => {
      const queryParams = new URLSearchParams();
      queryParams.append('period', filters.period);
      queryParams.append('type', filters.type);
      queryParams.append('category', filters.category);
      // For real backend, append authorization token in URL parameter or fetch directly
      const token = localStorage.getItem('sf_token');
      if (token) queryParams.append('token', token);
      return `/api/reports/pdf?${queryParams.toString()}`;
    },
    
    downloadExcelUrl: (filters: { period: string; type: string; category: string }) => {
      const queryParams = new URLSearchParams();
      queryParams.append('period', filters.period);
      queryParams.append('type', filters.type);
      queryParams.append('category', filters.category);
      const token = localStorage.getItem('sf_token');
      if (token) queryParams.append('token', token);
      return `/api/reports/excel?${queryParams.toString()}`;
    }
  }
};
