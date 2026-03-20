const API_URL = 'https://api.exchangerate-api.com/v4/latest/BRL';

function getStorageKey() {
  const session = AuthService ? AuthService.getSession() : null;
  return session ? `finance_tx_${session.userId}` : 'finance_dashboard_transactions';
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
  async fetchExchangeRates() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('API indisponível');
      const data = await response.json();
      return data.rates;
    } catch (error) {
      console.warn('Usando dados offline:', error.message);
      return { USD: 0.19, EUR: 0.18, GBP: 0.15 };
    }
  },

  loadTransactions() {
    const data = localStorage.getItem(getStorageKey());
    if (data) return JSON.parse(data);

    const sampleData = this.generateSampleData();
    this.saveTransactions(sampleData);
    return sampleData;
  },

  saveTransactions(transactions) {
    localStorage.setItem(getStorageKey(), JSON.stringify(transactions));
  },

  addTransaction(transaction) {
    const transactions = this.loadTransactions();
    transaction.id = Date.now().toString();
    transactions.push(transaction);
    this.saveTransactions(transactions);
    return transaction;
  },

  updateTransaction(id, updatedData) {
    const transactions = this.loadTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...updatedData };
      this.saveTransactions(transactions);
      return transactions[index];
    }
    return null;
  },

  deleteTransaction(id) {
    let transactions = this.loadTransactions();
    transactions = transactions.filter(t => t.id !== id);
    this.saveTransactions(transactions);
    return transactions;
  },

  generateSampleData() {
    const now = new Date();
    const data = [];

    const sampleItems = [
      { desc: 'Salário Mensal', type: 'income', cat: 'Salário', min: 4500, max: 6000 },
      { desc: 'Supermercado', type: 'expense', cat: 'Alimentação', min: 200, max: 600 },
      { desc: 'Aluguel', type: 'expense', cat: 'Moradia', min: 1200, max: 1800 },
      { desc: 'Conta de Luz', type: 'expense', cat: 'Contas', min: 80, max: 200 },
      { desc: 'Conta de Água', type: 'expense', cat: 'Contas', min: 40, max: 100 },
      { desc: 'Internet', type: 'expense', cat: 'Contas', min: 80, max: 150 },
      { desc: 'Uber/99', type: 'expense', cat: 'Transporte', min: 15, max: 60 },
      { desc: 'Combustível', type: 'expense', cat: 'Transporte', min: 150, max: 350 },
      { desc: 'Farmácia', type: 'expense', cat: 'Saúde', min: 30, max: 200 },
      { desc: 'Academia', type: 'expense', cat: 'Saúde', min: 80, max: 150 },
      { desc: 'Restaurante', type: 'expense', cat: 'Alimentação', min: 40, max: 150 },
      { desc: 'Streaming', type: 'expense', cat: 'Lazer', min: 20, max: 60 },
      { desc: 'Freelance Web', type: 'income', cat: 'Freelance', min: 500, max: 2000 },
      { desc: 'Dividendos', type: 'income', cat: 'Investimentos', min: 50, max: 300 },
      { desc: 'Roupas', type: 'expense', cat: 'Vestuário', min: 50, max: 300 },
      { desc: 'Material Escolar', type: 'expense', cat: 'Educação', min: 30, max: 150 },
    ];

    for (let m = 5; m >= 0; m--) {
      const date = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

      sampleItems.forEach(item => {
        const qty = item.type === 'income' ? 1 : Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < qty; i++) {
          const day = Math.floor(Math.random() * daysInMonth) + 1;
          const amount = Math.round((Math.random() * (item.max - item.min) + item.min) * 100) / 100;
          data.push({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            description: item.desc,
            amount,
            type: item.type,
            category: item.cat,
            date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          });
        }
      });
    }

    return data.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  getCategories(type) {
    return categories[type] || categories.expense;
  }
};
