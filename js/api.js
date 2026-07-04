const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/BRL';
const SERVER_BASE_URL = window.location.origin;

function getHeaders() {
  const token = AuthService ? AuthService.getToken() : null;
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

const categories = {
  expense: [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Lazer',
    'Vestuário',
    'Contas',
    'Outros'
  ],
  income: [
    'Salário',
    'Freelance',
    'Investimentos',
    'Vendas',
    'Outros'
  ]
};

const DataService = {
  // Câmbio (externo)
  async fetchExchangeRates() {
    try {
      const response = await fetch(EXCHANGE_API_URL);
      if (!response.ok) throw new Error('API de câmbio indisponível');
      const data = await response.json();
      return data.rates;
    } catch (error) {
      console.warn('Usando dados de câmbio offline:', error.message);
      return { USD: 0.19, EUR: 0.18, GBP: 0.15 };
    }
  },

  // CATEGORIAS
  getCategories(type) {
    return categories[type] || categories.expense;
  },

  // TRANSAÇÕES (Backend API)
  async loadTransactions(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${SERVER_BASE_URL}/api/transactions?${queryParams}`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Erro ao carregar transações');
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  async addTransaction(transaction) {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/api/transactions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(transaction)
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao adicionar transação');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      alert(error.message);
      return null;
    }
  },

  async updateTransaction(id, updatedData) {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/api/transactions/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updatedData)
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao atualizar transação');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      alert(error.message);
      return null;
    }
  },

  async deleteTransaction(id) {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/api/transactions/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Erro ao deletar transação');
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  // METAS DIÁRIAS (Backend API)
  async loadGoals(date) {
    try {
      const q = date ? `?date=${date}` : '';
      const response = await fetch(`${SERVER_BASE_URL}/api/goals${q}`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Erro ao carregar metas');
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  async updateGoal(tipo, progresso_valor, meta_valor, date) {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/api/goals/update`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ tipo, progresso_valor, meta_valor, date })
      });
      if (!response.ok) throw new Error('Erro ao atualizar meta');
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  // ORGANIZADOR DE ROTINA / TAREFAS (Backend API)
  async loadTasks(dia_semana) {
    try {
      const q = dia_semana ? `?dia_semana=${dia_semana}` : '';
      const response = await fetch(`${SERVER_BASE_URL}/api/tasks${q}`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Erro ao carregar rotina');
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  async addTask(task) {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(task)
      });
      if (!response.ok) throw new Error('Erro ao criar tarefa');
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  async updateTask(id, taskData) {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/api/tasks/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(taskData)
      });
      if (!response.ok) throw new Error('Erro ao atualizar tarefa');
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  async toggleTask(id) {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/api/tasks/${id}/toggle`, {
        method: 'PATCH',
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Erro ao alterar status da tarefa');
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  async populateDefaultTasks() {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/api/tasks/populate-defaults`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Erro ao popular rotina');
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  async deleteTask(id) {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/api/tasks/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Erro ao excluir tarefa');
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  // RELATÓRIOS (PDF, Excel, CSV)
  async downloadReport(format, filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `${SERVER_BASE_URL}/api/reports/${format}?${queryParams}`;
      
      const token = AuthService ? AuthService.getToken() : null;
      
      // Abre uma requisição fetch para baixar o arquivo como Blob e manter o Header de Autenticação JWT seguro
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (!response.ok) throw new Error('Erro ao baixar relatório.');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      
      let extension = format;
      if (format === 'excel') extension = 'xlsx';
      
      a.download = `relatorio_financeiro_${filters.period || 'todos'}.${extension}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      alert('Não foi possível exportar o relatório.');
    }
  },

  // ADMINISTRAÇÃO (Backend API)
  async getAdminStats() {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/api/admin/stats`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Erro ao buscar estatísticas');
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  async getAdminUsers() {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/api/admin/users`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Erro ao buscar usuários');
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  async createAdminUser(userData) {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/api/admin/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData)
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao criar usuário');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      alert(error.message);
      return null;
    }
  },

  async updateAdminUser(id, userData) {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/api/admin/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(userData)
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao editar usuário');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      alert(error.message);
      return null;
    }
  },

  async toggleBlockAdminUser(id) {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/api/admin/users/${id}/toggle-block`, {
        method: 'PATCH',
        headers: getHeaders()
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao bloquear/desbloquear usuário');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      alert(error.message);
      return null;
    }
  },

  async resetAdminUserPassword(id, newPassword) {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/api/admin/users/${id}/reset-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ newPassword })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao redefinir senha');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      alert(error.message);
      return null;
    }
  },

  async deleteAdminUser(id) {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao excluir usuário');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      alert(error.message);
      return null;
    }
  },

  async getAdminUserAccessHistory(id) {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/api/admin/users/${id}/access`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Erro ao buscar histórico de acessos');
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  async getAdminLogs() {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/api/admin/logs`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Erro ao buscar logs administrativos');
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  }
};
