const App = {
  transactions: [],
  currentFilters: {
    search: '',
    period: 'all',
    category: 'all',
    type: 'all',
    sortBy: 'date-desc'
  },

  init() {
    if (typeof AuthService !== 'undefined' && !AuthService.requireAuth()) return;

    this.transactions = DataService.loadTransactions();
    this.cacheDOM();
    this.bindEvents();
    this.populateCategoryFilter();
    this.updateDashboard();
    this.updateUserDisplay();
  },

  updateUserDisplay() {
    const session = AuthService ? AuthService.getSession() : null;
    const userName = document.getElementById('user-name');
    if (session && userName) {
      userName.textContent = session.name;
    }
  },

  cacheDOM() {
    this.el = {
      totalIncome: document.getElementById('total-income'),
      totalExpense: document.getElementById('total-expense'),
      totalBalance: document.getElementById('total-balance'),
      transactionsList: document.getElementById('transactions-list'),
      filterSearch: document.getElementById('filter-search'),
      filterPeriod: document.getElementById('filter-period'),
      filterCategory: document.getElementById('filter-category'),
      filterType: document.getElementById('filter-type'),
      filterSort: document.getElementById('filter-sort'),
      modal: document.getElementById('modal-transaction'),
      modalTitle: document.getElementById('modal-title'),
      modalClose: document.getElementById('modal-close'),
      btnAdd: document.getElementById('btn-add-transaction'),
      form: document.getElementById('form-transaction'),
      txId: document.getElementById('tx-id'),
      txDesc: document.getElementById('tx-description'),
      txAmount: document.getElementById('tx-amount'),
      txType: document.getElementById('tx-type'),
      txCategory: document.getElementById('tx-category'),
      txDate: document.getElementById('tx-date')
    };
  },

  bindEvents() {
    this.el.btnAdd.addEventListener('click', () => this.openModal());
    this.el.modalClose.addEventListener('click', () => this.closeModal());
    this.el.modal.addEventListener('click', (e) => {
      if (e.target === this.el.modal) this.closeModal();
    });
    this.el.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.el.txType.addEventListener('change', () => this.updateCategoryOptions());
    this.el.filterSearch.addEventListener('input', () => this.handleFilterChange());
    this.el.filterPeriod.addEventListener('change', () => this.handleFilterChange());
    this.el.filterCategory.addEventListener('change', () => this.handleFilterChange());
    this.el.filterType.addEventListener('change', () => this.handleFilterChange());
    this.el.filterSort.addEventListener('change', () => this.handleFilterChange());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        if (confirm('Deseja sair da sua conta?')) {
          AuthService.logout();
        }
      });
    }
  },

  handleFilterChange() {
    this.currentFilters = {
      search: this.el.filterSearch.value,
      period: this.el.filterPeriod.value,
      category: this.el.filterCategory.value,
      type: this.el.filterType.value,
      sortBy: this.el.filterSort.value
    };
    this.updateDashboard();
  },

  populateCategoryFilter() {
    const cats = FilterService.getUniqueCategories(this.transactions);
    this.el.filterCategory.innerHTML = '<option value="all">Todas</option>';
    cats.forEach(cat => {
      this.el.filterCategory.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
  },

  updateCategoryOptions() {
    const type = this.el.txType.value;
    const cats = DataService.getCategories(type);
    this.el.txCategory.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
  },

  updateDashboard() {
    const filtered = FilterService.applyFilters(this.transactions, this.currentFilters);
    const totals = FilterService.calculateTotals(filtered);

    this.el.totalIncome.textContent = this.formatCurrency(totals.income);
    this.el.totalExpense.textContent = this.formatCurrency(totals.expense);
    this.el.totalBalance.textContent = this.formatCurrency(totals.balance);

    this.renderTransactions(filtered);
    ChartService.updateAllCharts(filtered);
  },

  renderTransactions(transactions) {
    if (transactions.length === 0) {
      this.el.transactionsList.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">Nenhuma transação encontrada.</p>';
      return;
    }

    this.el.transactionsList.innerHTML = transactions.slice(0, 50).map(t => `
      <div class="transaction-item" data-id="${t.id}">
        <div class="transaction-info">
          <span class="transaction-desc">${t.description}</span>
          <span class="transaction-meta">${t.category} · ${this.formatDate(t.date)}</span>
        </div>
        <span class="transaction-amount ${t.type}">${t.type === 'income' ? '+' : '-'} ${this.formatCurrency(t.amount)}</span>
        <div class="transaction-actions">
          <button class="btn-icon edit" onclick="App.editTransaction('${t.id}')" title="Editar">✎</button>
          <button class="btn-icon delete" onclick="App.deleteTransaction('${t.id}')" title="Excluir">✕</button>
        </div>
      </div>
    `).join('');
  },

  openModal(transaction = null) {
    this.el.modal.classList.add('active');
    this.el.form.reset();
    this.el.txId.value = '';
    this.updateCategoryOptions();

    if (transaction) {
      this.el.modalTitle.textContent = 'Editar Transação';
      this.el.txId.value = transaction.id;
      this.el.txDesc.value = transaction.description;
      this.el.txAmount.value = transaction.amount;
      this.el.txType.value = transaction.type;
      this.updateCategoryOptions();
      this.el.txCategory.value = transaction.category;
      this.el.txDate.value = transaction.date;
    } else {
      this.el.modalTitle.textContent = 'Nova Transação';
      this.el.txDate.value = new Date().toISOString().split('T')[0];
    }

    this.el.txDesc.focus();
  },

  closeModal() {
    this.el.modal.classList.remove('active');
  },

  handleSubmit(e) {
    e.preventDefault();

    const data = {
      description: this.el.txDesc.value.trim(),
      amount: parseFloat(this.el.txAmount.value),
      type: this.el.txType.value,
      category: this.el.txCategory.value,
      date: this.el.txDate.value
    };

    const id = this.el.txId.value;
    if (id) {
      DataService.updateTransaction(id, data);
    } else {
      DataService.addTransaction(data);
    }

    this.transactions = DataService.loadTransactions();
    this.populateCategoryFilter();
    this.updateDashboard();
    this.closeModal();
  },

  editTransaction(id) {
    const tx = this.transactions.find(t => t.id === id);
    if (tx) this.openModal(tx);
  },

  deleteTransaction(id) {
    if (confirm('Deseja realmente excluir esta transação?')) {
      DataService.deleteTransaction(id);
      this.transactions = DataService.loadTransactions();
      this.populateCategoryFilter();
      this.updateDashboard();
    }
  },

  formatCurrency(value) {
    return `R$ ${(value || 0).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  },

  formatDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
