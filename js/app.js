const App = {
  transactions: [],
  selectedDay: 'segunda',
  selectedGoalsDate: new Date().toISOString().split('T')[0],
  currentFilters: {
    search: '',
    period: 'current-month',
    category: 'all',
    type: 'all',
    sortBy: 'date-desc'
  },
  notifications: [],

  async init() {
    if (typeof AuthService !== 'undefined' && !AuthService.requireAuth()) return;

    // Carregar tema salvo antes
    const savedTheme = localStorage.getItem('strong_finance_theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
    }

    this.cacheDOM();
    this.bindEvents();
    
    // Configurar usuário atual
    const user = AuthService.getUser();
    if (user) {
      this.el.userName.textContent = user.nome;
      this.el.userRole.textContent = user.cargo === 'admin' ? 'Administrador' : 'Usuário Comum';
      if (user.cargo === 'admin') {
        this.el.adminLink.style.display = 'flex';
      }
    }

    // Inicializar data nas metas
    this.el.goalsDatePicker.value = this.selectedGoalsDate;

    // Carregar dados iniciais do Dashboard
    await this.refreshDashboardData();
    this.populateCategoryFilter();
    
    // Gerar notificações iniciais
    this.generateAlerts();

    // Carregar rotina e metas
    await this.loadRoutine();
    await this.loadGoals();
  },

  cacheDOM() {
    this.el = {
      // Sidebar e Layout
      userName: document.getElementById('user-name'),
      userRole: document.getElementById('user-role'),
      adminLink: document.getElementById('menu-admin-link'),
      btnToggleTheme: document.getElementById('btn-toggle-theme'),
      btnLogout: document.getElementById('btn-logout'),
      menuItems: document.querySelectorAll('.menu-item'),
      sections: document.querySelectorAll('.content-section'),
      activeTitle: document.getElementById('active-section-title'),
      
      // Notificações
      btnNotif: document.getElementById('btn-notification'),
      notifBadge: document.getElementById('notif-badge'),
      notifDropdown: document.getElementById('notif-dropdown'),
      notifList: document.getElementById('notif-list'),
      btnClearNotif: document.getElementById('btn-clear-notif'),

      // Dashboard
      totalIncome: document.getElementById('total-income'),
      totalExpense: document.getElementById('total-expense'),
      totalBalance: document.getElementById('total-balance'),
      totalSavings: document.getElementById('total-savings'),
      btnAddTx: document.getElementById('btn-add-transaction'),
      transactionsList: document.getElementById('transactions-list'),
      filterSearch: document.getElementById('filter-search'),
      filterPeriod: document.getElementById('filter-period'),
      filterCategory: document.getElementById('filter-category'),
      filterType: document.getElementById('filter-type'),
      filterSort: document.getElementById('filter-sort'),

      // Modais Transação
      modalTx: document.getElementById('modal-transaction'),
      modalTxTitle: document.getElementById('modal-title'),
      modalTxClose: document.getElementById('modal-close'),
      formTx: document.getElementById('form-transaction'),
      txId: document.getElementById('tx-id'),
      txDesc: document.getElementById('tx-description'),
      txAmount: document.getElementById('tx-amount'),
      txType: document.getElementById('tx-type'),
      txCategory: document.getElementById('tx-category'),
      txDate: document.getElementById('tx-date'),
      txObs: document.getElementById('tx-obs'),

      // Rotina / Tarefas
      btnAddTask: document.getElementById('btn-add-task'),
      btnPopulateRoutine: document.getElementById('btn-populate-routine'),
      weekdayTabs: document.querySelectorAll('.weekday-tab'),
      routineDayTitle: document.getElementById('routine-day-title'),
      tasksContainer: document.getElementById('tasks-list-container'),
      modalTask: document.getElementById('modal-task'),
      modalTaskClose: document.getElementById('btn-close-task-modal'),
      formTask: document.getElementById('form-task'),
      taskId: document.getElementById('task-id'),
      taskDesc: document.getElementById('task-desc'),
      taskTime: document.getElementById('task-time'),
      taskCategory: document.getElementById('task-category'),
      taskPriority: document.getElementById('task-priority'),
      taskDuration: document.getElementById('task-duration'),
      taskWeekday: document.getElementById('task-weekday'),
      taskRecurrent: document.getElementById('task-recurrent'),

      // Metas
      goalsDatePicker: document.getElementById('goals-datepicker'),
      goalCards: document.querySelectorAll('.goal-card'),
      modalGoalTarget: document.getElementById('modal-goal-target'),
      modalGoalTargetClose: document.getElementById('btn-close-goal-modal'),
      formGoalTarget: document.getElementById('form-goal-target'),
      goalTargetVal: document.getElementById('goal-target-val'),
      goalTargetType: document.getElementById('goal-target-type'),
      lblGoalTargetVal: document.getElementById('lbl-goal-target-val'),

      // Relatórios
      reportPeriod: document.getElementById('report-period-select'),
      btnExportPDF: document.getElementById('btn-export-pdf'),
      btnExportExcel: document.getElementById('btn-export-excel'),
      btnExportCSV: document.getElementById('btn-export-csv'),

      // Calculadora
      btnOpenCalc: document.getElementById('btn-open-calc-menu'),
      modalCalc: document.getElementById('modal-calculator'),
      btnCloseCalc: document.getElementById('btn-close-calc-modal'),
      calcDisplay: document.getElementById('calc-display'),
      calcKeys: document.querySelectorAll('.calc-key'),
      calcTabs: document.querySelectorAll('.calc-tab-btn'),
      calcSections: document.querySelectorAll('.calc-section'),
      interestType: document.getElementById('interest-type'),
      interestCapital: document.getElementById('interest-capital'),
      interestRate: document.getElementById('interest-rate'),
      interestTime: document.getElementById('interest-time'),
      btnCalcInterest: document.getElementById('btn-calc-interest'),
      interestResultBox: document.getElementById('interest-result-box'),
      interestResJuros: document.getElementById('interest-res-juros'),
      interestResMontante: document.getElementById('interest-res-montante'),
      simType: document.getElementById('sim-type'),
      simVal1: document.getElementById('sim-val1'),
      simVal2: document.getElementById('sim-val2'),
      simVal3: document.getElementById('sim-val3'),
      simValInitial: document.getElementById('sim-val-initial'),
      simOptionalGroup: document.getElementById('sim-optional-group'),
      btnRunSimulation: document.getElementById('btn-run-simulation'),
      simResultBox: document.getElementById('sim-result-box')
    };
  },

  bindEvents() {
    // Evento Alternar Tema
    if (this.el.btnToggleTheme) {
      this.el.btnToggleTheme.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        localStorage.setItem('strong_finance_theme', isLight ? 'light' : 'dark');
      });
    }

    // Evento Logout
    this.el.btnLogout.addEventListener('click', () => {
      if (confirm('Deseja realmente sair da sua conta?')) {
        AuthService.logout();
      }
    });

    // Navegação Sidebar
    this.el.menuItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const target = item.dataset.target;
        if (!target) return; // Calculadora é tratada separadamente

        // Atualiza botões
        this.el.menuItems.forEach(m => m.classList.remove('active'));
        item.classList.add('active');

        // Mostra seção
        this.el.sections.forEach(s => s.classList.remove('active'));
        const activeSection = document.getElementById(target);
        activeSection.classList.add('active');

        // Ajusta título do header
        this.el.activeTitle.textContent = item.textContent.trim().substring(2);

        // Controla botão "+ Nova Transação" do topo
        if (target === 'sec-dashboard') {
          this.el.btnAddTx.style.display = 'block';
        } else {
          this.el.btnAddTx.style.display = 'none';
        }
      });
    });

    // Notificações Dropdown
    this.el.btnNotif.addEventListener('click', (e) => {
      e.stopPropagation();
      this.el.notifDropdown.classList.toggle('active');
    });
    document.addEventListener('click', () => {
      this.el.notifDropdown.classList.remove('active');
    });
    this.el.notifDropdown.addEventListener('click', (e) => e.stopPropagation());
    this.el.btnClearNotif.addEventListener('click', () => {
      this.notifications = [];
      this.renderAlerts();
    });

    // --- TRANSAÇÕES ---
    this.el.btnAddTx.addEventListener('click', () => this.openTxModal());
    this.el.modalTxClose.addEventListener('click', () => this.closeTxModal());
    this.el.formTx.addEventListener('submit', (e) => this.handleTxSubmit(e));
    this.el.txType.addEventListener('change', () => this.updateTxCategoryOptions());
    
    // Filtros do Dashboard
    this.el.filterSearch.addEventListener('input', () => this.handleFilterChange());
    this.el.filterPeriod.addEventListener('change', () => this.handleFilterChange());
    this.el.filterCategory.addEventListener('change', () => this.handleFilterChange());
    this.el.filterType.addEventListener('change', () => this.handleFilterChange());
    this.el.filterSort.addEventListener('change', () => this.handleFilterChange());

    // --- ROTINA / AGENDA ---
    this.el.btnAddTask.addEventListener('click', () => this.openTaskModal());
    this.el.modalTaskClose.addEventListener('click', () => this.closeTaskModal());
    this.el.formTask.addEventListener('submit', (e) => this.handleTaskSubmit(e));
    this.el.btnPopulateRoutine.addEventListener('click', () => this.handlePopulateRoutine());
    
    this.el.weekdayTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.el.weekdayTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.selectedDay = tab.dataset.day;
        this.el.routineDayTitle.textContent = `Tarefas de ${this.selectedDay === 'diario' ? 'Todos os dias' : this.selectedDay + '-feira'}`;
        this.loadRoutine();
      });
    });

    // --- METAS DIÁRIAS ---
    this.el.goalsDatePicker.addEventListener('change', (e) => {
      this.selectedGoalsDate = e.target.value;
      this.loadGoals();
    });
    
    this.el.modalGoalTargetClose.addEventListener('click', () => this.closeGoalTargetModal());
    this.el.formGoalTarget.addEventListener('submit', (e) => this.handleGoalTargetSubmit(e));

    // --- RELATÓRIOS ---
    this.el.btnExportPDF.addEventListener('click', () => this.exportReport('pdf'));
    this.el.btnExportExcel.addEventListener('click', () => this.exportReport('excel'));
    this.el.btnExportCSV.addEventListener('click', () => this.exportReport('csv'));

    // --- CALCULADORA ---
    this.el.btnOpenCalc.addEventListener('click', () => this.openCalcModal());
    this.el.btnCloseCalc.addEventListener('click', () => this.closeCalcModal());
    
    // Chaves da Calculadora Básica
    this.el.calcKeys.forEach(key => {
      key.addEventListener('click', () => this.handleCalcInput(key.dataset.val));
    });

    // Abas da Calculadora
    this.el.calcTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.el.calcTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        this.el.calcSections.forEach(s => s.style.display = 'none');
        document.getElementById(`calc-${tab.dataset.calc}`).style.display = tab.dataset.calc === 'math' ? 'block' : 'flex';
      });
    });

    this.el.interestType.addEventListener('change', (e) => {
      this.el.interestResultBox.style.display = 'none';
    });

    this.el.simType.addEventListener('change', (e) => {
      const type = e.target.value;
      this.el.simResultBox.style.display = 'none';
      if (type === 'loan') {
        document.getElementById('sim-lbl-val1').textContent = 'Taxa de Juros Mensal (%)';
        document.getElementById('sim-lbl-val2').textContent = 'Prazo (Meses)';
        document.getElementById('sim-lbl-val3').textContent = 'Carência (Opcional - Meses)';
        this.el.simVal1.placeholder = 'Ex: 1.5';
        this.el.simVal2.placeholder = 'Ex: 12';
        this.el.simVal3.placeholder = 'Ex: 0';
        this.el.simOptionalGroup.style.display = 'flex';
      } else {
        document.getElementById('sim-lbl-val1').textContent = 'Valor Mensal do Aporte (R$)';
        document.getElementById('sim-lbl-val2').textContent = 'Taxa de Juros Anual (%)';
        document.getElementById('sim-lbl-val3').textContent = 'Prazo (Meses)';
        this.el.simVal1.placeholder = 'Ex: 200';
        this.el.simVal2.placeholder = 'Ex: 12';
        this.el.simVal3.placeholder = 'Ex: 60';
        this.el.simOptionalGroup.style.display = 'none';
      }
    });

    this.el.btnCalcInterest.addEventListener('click', () => this.calculateInterest());
    this.el.btnRunSimulation.addEventListener('click', () => this.runCalculatorSimulation());

    // Fechar modais ao teclar ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeTxModal();
        this.closeTaskModal();
        this.closeGoalTargetModal();
        this.closeCalcModal();
      }
    });
  },

  // --- REFRESH E FILTROS DO DASHBOARD ---
  async refreshDashboardData() {
    this.transactions = await DataService.loadTransactions(this.currentFilters);
    this.updateDashboardUI();
  },

  handleFilterChange() {
    this.currentFilters = {
      search: this.el.filterSearch.value,
      period: this.el.filterPeriod.value,
      category: this.el.filterCategory.value,
      type: this.el.filterType.value,
      sortBy: this.el.filterSort.value
    };
    this.refreshDashboardData();
  },

  populateCategoryFilter() {
    const defaultCats = [...categories.expense, ...categories.income];
    const unique = [...new Set(defaultCats)].sort();
    
    this.el.filterCategory.innerHTML = '<option value="all">Todas</option>';
    unique.forEach(cat => {
      this.el.filterCategory.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
  },

  updateDashboardUI() {
    let incomeTotal = 0;
    let expenseTotal = 0;

    this.transactions.forEach(t => {
      const val = parseFloat(t.valor);
      if (t.type === 'income') incomeTotal += val;
      else expenseTotal += val;
    });

    const balance = incomeTotal - expenseTotal;

    this.el.totalIncome.textContent = this.formatCurrency(incomeTotal);
    this.el.totalExpense.textContent = this.formatCurrency(expenseTotal);
    this.el.totalBalance.textContent = this.formatCurrency(balance);
    
    // Economia do Mês
    this.el.totalSavings.textContent = this.formatCurrency(balance >= 0 ? balance : 0);
    this.el.totalSavings.style.color = balance >= 0 ? 'var(--success)' : 'var(--danger)';

    this.renderTransactions();
    ChartService.updateAllCharts(this.transactions);
  },

  renderTransactions() {
    if (this.transactions.length === 0) {
      this.el.transactionsList.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">Nenhuma transação encontrada para os filtros aplicados.</p>';
      return;
    }

    this.el.transactionsList.innerHTML = this.transactions.map(t => {
      const formattedVal = parseFloat(t.valor).toFixed(2).replace('.', ',');
      const obsMarkup = t.observacao ? `<small style="display:block; color: var(--text-muted); margin-top: 0.2rem;">Obs: ${t.observacao}</small>` : '';

      return `
        <div class="transaction-item" data-id="${t.id}">
          <div class="transaction-info">
            <span class="transaction-desc">${t.descricao}</span>
            <span class="transaction-meta">${t.categoria} · ${this.formatDate(t.data)}</span>
            ${obsMarkup}
          </div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <span class="transaction-amount ${t.type}">${t.type === 'income' ? '+' : '-'} R$ ${formattedVal}</span>
            <div class="transaction-actions">
              <button class="btn-icon edit" onclick="App.editTransaction(${t.id})" title="Editar">✎</button>
              <button class="btn-icon delete" onclick="App.deleteTransaction(${t.id})" title="Excluir">✕</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  // --- MODAL: TRANSAÇÃO ---
  openTxModal(tx = null) {
    this.el.modalTx.classList.add('active');
    this.el.formTx.reset();
    this.el.txId.value = '';
    this.updateTxCategoryOptions();

    if (tx) {
      this.el.modalTxTitle.textContent = 'Editar Transação';
      this.el.txId.value = tx.id;
      this.el.txDesc.value = tx.descricao;
      this.el.txAmount.value = tx.valor;
      this.el.txType.value = tx.tipo;
      this.updateTxCategoryOptions();
      this.el.txCategory.value = tx.categoria;
      this.el.txDate.value = tx.data.split('T')[0];
      this.el.txObs.value = tx.observacao || '';
    } else {
      this.el.modalTxTitle.textContent = 'Nova Transação';
      this.el.txDate.value = new Date().toISOString().split('T')[0];
    }
    this.el.txDesc.focus();
  },

  closeTxModal() {
    this.el.modalTx.classList.remove('active');
  },

  updateTxCategoryOptions() {
    const type = this.el.txType.value;
    const cats = DataService.getCategories(type);
    this.el.txCategory.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
  },

  async handleTxSubmit(e) {
    e.preventDefault();
    const id = this.el.txId.value;

    const data = {
      descricao: this.el.txDesc.value.trim(),
      valor: parseFloat(this.el.txAmount.value),
      tipo: this.el.txType.value,
      categoria: this.el.txCategory.value,
      data: this.el.txDate.value,
      observacao: this.el.txObs.value.trim()
    };

    let result;
    if (id) {
      result = await DataService.updateTransaction(id, data);
    } else {
      result = await DataService.addTransaction(data);
    }

    if (result) {
      this.closeTxModal();
      await this.refreshDashboardData();
      this.generateAlerts();
    }
  },

  async editTransaction(id) {
    const tx = this.transactions.find(t => t.id == id);
    if (tx) {
      this.openTxModal(tx);
    } else {
      // Se não estiver na lista local por conta de filtros, busca no banco
      const response = await fetch(`${SERVER_BASE_URL}/api/transactions/${id}`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const dbTx = await response.json();
        this.openTxModal(dbTx);
      }
    }
  },

  async deleteTransaction(id) {
    if (confirm('Deseja realmente excluir esta transação?')) {
      const result = await DataService.deleteTransaction(id);
      if (result) {
        await this.refreshDashboardData();
        this.generateAlerts();
      }
    }
  },

  // --- ROTINA / AGENDA ---
  async loadRoutine() {
    const tasks = await DataService.loadTasks(this.selectedDay);
    this.renderTasks(tasks);
  },

  renderTasks(tasks) {
    if (tasks.length === 0) {
      this.el.tasksContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">Nenhuma atividade cadastrada para este dia.</p>';
      return;
    }

    this.el.tasksContainer.innerHTML = tasks.map(t => {
      const isConcluida = t.status === 'concluida';
      const checkedAttr = isConcluida ? 'checked' : '';
      const priorityColor = t.prioridade === 'alta' ? '#ef4444' : t.prioridade === 'media' ? '#f59e0b' : '#10b981';

      return `
        <div class="task-item" style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 1rem; background: var(--bg-input); border-radius: 8px; border-left: 4px solid ${priorityColor}; opacity: ${isConcluida ? '0.6' : '1'}; transition: opacity 0.2s;">
          <div style="display: flex; align-items: center; gap: 0.8rem; flex-grow: 1;">
            <input type="checkbox" ${checkedAttr} onchange="App.toggleTaskStatus(${t.id})" style="width: 18px; height: 18px; cursor: pointer;">
            <div style="display: flex; flex-direction: column;">
              <span class="task-description-label" style="font-weight: 600; text-decoration: ${isConcluida ? 'line-through' : 'none'};">${t.descricao}</span>
              <span style="font-size: 0.8rem; color: var(--text-muted);">${t.horario.substring(0,5)} · ${t.categoria} · Estimado: ${t.tempo_estimado} min</span>
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <span style="font-size: 0.75rem; font-weight: bold; background: rgba(255,255,255,0.05); padding: 0.2rem 0.5rem; border-radius: 4px; text-transform: uppercase;">${t.prioridade}</span>
            <button class="btn-icon" onclick="App.editTask(${t.id})" style="font-size: 0.9rem;">✎</button>
            <button class="btn-icon delete" onclick="App.deleteTask(${t.id})" style="font-size: 0.9rem;">✕</button>
          </div>
        </div>
      `;
    }).join('');
  },

  openTaskModal(task = null) {
    this.el.modalTask.classList.add('active');
    this.el.formTask.reset();
    this.el.taskId.value = '';
    
    if (task) {
      this.el.elTitle = 'Editar Tarefa';
      this.el.taskId.value = task.id;
      this.el.taskDesc.value = task.descricao;
      this.el.taskTime.value = task.horario.substring(0, 5);
      this.el.taskCategory.value = task.categoria;
      this.el.taskPriority.value = task.prioridade;
      this.el.taskDuration.value = task.tempo_estimado;
      this.el.taskWeekday.value = task.dia_semana;
      this.el.taskRecurrent.checked = task.recorrente === 1 || task.recorrente === true;
    } else {
      this.el.elTitle = 'Nova Tarefa da Rotina';
      this.el.taskWeekday.value = this.selectedDay === 'diario' ? 'diario' : this.selectedDay;
      const now = new Date();
      this.el.taskTime.value = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    }
    this.el.taskDesc.focus();
  },

  closeTaskModal() {
    this.el.modalTask.classList.remove('active');
  },

  async handleTaskSubmit(e) {
    e.preventDefault();
    const id = this.el.taskId.value;
    
    const data = {
      descricao: this.el.taskDesc.value.trim(),
      horario: this.el.taskTime.value + ':00',
      categoria: this.el.taskCategory.value.trim(),
      prioridade: this.el.taskPriority.value,
      tempo_estimado: parseInt(this.el.taskDuration.value),
      dia_semana: this.el.taskWeekday.value,
      recorrente: this.el.taskRecurrent.checked
    };

    let result;
    if (id) {
      result = await DataService.updateTask(id, data);
    } else {
      result = await DataService.addTask(data);
    }

    if (result) {
      this.closeTaskModal();
      await this.loadRoutine();
      this.generateAlerts();
    }
  },

  async toggleTaskStatus(id) {
    const result = await DataService.toggleTask(id);
    if (result) {
      await this.loadRoutine();
      this.generateAlerts();
    }
  },

  async editTask(id) {
    // Busca do servidor para ter dados frescos
    const response = await fetch(`${SERVER_BASE_URL}/api/tasks`, { headers: getHeaders() });
    if (response.ok) {
      const list = await response.json();
      const task = list.find(t => t.id == id);
      if (task) this.openTaskModal(task);
    }
  },

  async deleteTask(id) {
    if (confirm('Excluir esta atividade da sua rotina?')) {
      const result = await DataService.deleteTask(id);
      if (result) {
        await this.loadRoutine();
        this.generateAlerts();
      }
    }
  },

  async handlePopulateRoutine() {
    const result = await DataService.populateDefaultTasks();
    if (result) {
      alert('Tarefas básicas da rotina adicionadas com sucesso!');
      await this.loadRoutine();
      this.generateAlerts();
    }
  },

  // --- METAS DIÁRIAS ---
  async loadGoals() {
    const goals = await DataService.loadGoals(this.selectedGoalsDate);
    
    this.el.goalCards.forEach(card => {
      const type = card.dataset.goalType;
      const goal = goals.find(g => g.tipo === type);
      
      if (goal) {
        const current = parseFloat(goal.progresso_valor);
        const target = parseFloat(goal.meta_valor);
        
        card.querySelector('.goal-current').textContent = current;
        card.querySelector('.goal-target').textContent = target;
        
        const percent = Math.min((current / target) * 100, 100);
        card.querySelector('.progress-bar-fill').style.width = `${percent}%`;

        // Wire up increment/reset buttons dynamically
        const adjustBtns = card.querySelectorAll('.btn-adjust-goal');
        adjustBtns.forEach(btn => {
          // Remover event listeners anteriores clonando os botões
          const newBtn = btn.cloneNode(true);
          btn.parentNode.replaceChild(newBtn, btn);
          
          newBtn.addEventListener('click', async () => {
            const action = newBtn.dataset.action;
            let newProgress = current;
            
            if (action === 'add') {
              newProgress += parseFloat(newBtn.dataset.value);
            } else if (action === 'reset') {
              newProgress = 0;
            }

            const updateRes = await DataService.updateGoal(type, newProgress, target, this.selectedGoalsDate);
            if (updateRes) {
              await this.loadGoals();
              this.generateAlerts();
            }
          });
        });

        // Configurar botão de ajuste da meta target
        const editTargetBtn = card.querySelector('.btn-edit-goal-target');
        const newEditTargetBtn = editTargetBtn.cloneNode(true);
        editTargetBtn.parentNode.replaceChild(newEditTargetBtn, editTargetBtn);
        
        newEditTargetBtn.addEventListener('click', () => {
          this.openGoalTargetModal(type, target);
        });
      }
    });
  },

  openGoalTargetModal(type, currentTarget) {
    this.el.modalGoalTarget.classList.add('active');
    this.el.goalTargetType.value = type;
    this.el.goalTargetVal.value = currentTarget;

    const labels = {
      agua: 'Nova Meta de Água (ml)',
      estudos: 'Nova Meta de Estudos (minutos)',
      exercicios: 'Nova Meta de Exercícios (minutos)',
      horas_trabalhadas: 'Nova Meta de Trabalho (minutos)',
      economia_dia: 'Nova Meta de Economia (R$)'
    };
    
    this.el.lblGoalTargetVal.textContent = labels[type] || 'Novo Valor Alvo';
    this.el.goalTargetVal.focus();
  },

  closeGoalTargetModal() {
    this.el.modalGoalTarget.classList.remove('active');
  },

  async handleGoalTargetSubmit(e) {
    e.preventDefault();
    const type = this.el.goalTargetType.value;
    const newVal = parseFloat(this.el.goalTargetVal.value);

    if (newVal > 0) {
      const result = await DataService.updateGoal(type, undefined, newVal, this.selectedGoalsDate);
      if (result) {
        this.closeGoalTargetModal();
        await this.loadGoals();
        this.generateAlerts();
      }
    }
  },

  // --- RELATÓRIOS EXPORT ---
  exportReport(format) {
    const period = this.el.reportPeriod.value;
    DataService.downloadReport(format, { period });
  },

  // --- CALCULADORA ---
  openCalcModal() {
    this.el.modalCalculator.classList.add('active');
    this.el.calcDisplay.value = '';
    // Simula clique na aba Padrão
    document.querySelector('.calc-tab-btn[data-calc="math"]').click();
  },

  closeCalcModal() {
    this.el.modalCalculator.classList.remove('remove');
    this.el.modalCalculator.classList.remove('active');
  },

  handleCalcInput(value) {
    let current = this.el.calcDisplay.value;
    
    if (value === 'C') {
      this.el.calcDisplay.value = '';
    } else if (value === 'back') {
      this.el.calcDisplay.value = current.slice(0, -1);
    } else if (value === '=') {
      try {
        // Trata a expressão antes de computar
        let expr = current.replace(/×/g, '*').replace(/÷/g, '/');
        
        // Proteção contra eval perigoso
        if (/[^0-9\+\-\*\/\.\%\(\)]/.test(expr)) {
          throw new Error('Caractere inválido');
        }

        // Substitui por cento (ex: 50% => 0.50)
        expr = expr.replace(/(\d+)%/g, '($1/100)');

        const res = eval(expr);
        this.el.calcDisplay.value = Number.isInteger(res) ? res : parseFloat(res.toFixed(6));
      } catch (err) {
        this.el.calcDisplay.value = 'Erro';
      }
    } else {
      if (current === 'Erro') current = '';
      
      const charMap = {
        '*': '×',
        '/': '÷'
      };
      
      this.el.calcDisplay.value = current + (charMap[value] || value);
    }
  },

  calculateInterest() {
    const capital = parseFloat(this.el.interestCapital.value);
    const rate = parseFloat(this.el.interestRate.value) / 100;
    const time = parseFloat(this.el.interestTime.value);
    const type = this.el.interestType.value;

    if (isNaN(capital) || isNaN(rate) || isNaN(time)) {
      alert('Preencha todos os campos numéricos da calculadora de juros.');
      return;
    }

    let montante = 0;
    let juros = 0;

    if (type === 'simple') {
      juros = capital * rate * time;
      montante = capital + juros;
    } else {
      montante = capital * Math.pow((1 + rate), time);
      juros = montante - capital;
    }

    this.el.interestResJuros.textContent = this.formatCurrency(juros);
    this.el.interestResMontante.textContent = this.formatCurrency(montante);
    this.el.interestResultBox.style.display = 'block';
  },

  runCalculatorSimulation() {
    const type = this.el.simType.value;
    const v1 = parseFloat(this.el.simVal1.value); // Aporte Mensal OR Juros Mensal
    const v2 = parseFloat(this.el.simVal2.value); // Juros Anual OR Prazo
    const v3 = parseFloat(this.el.simVal3.value); // Prazo OR Carência
    const valInitial = parseFloat(this.el.simValInitial.value); // Financiado

    if (type === 'invest') {
      if (isNaN(v1) || isNaN(v2) || isNaN(v3)) {
        alert('Preencha os campos de Aporte, Taxa e Prazo.');
        return;
      }
      
      const aporte = v1;
      const taxaMensal = Math.pow(1 + (v2 / 100), 1 / 12) - 1; // Conversão taxa anual para mensal composta
      const prazo = v3;

      // VF = PMT * (((1 + i)^n - 1) / i)
      const valorFinal = aporte * ((Math.pow(1 + taxaMensal, prazo) - 1) / taxaMensal);
      const totalInvestido = aporte * prazo;
      const jurosGanhos = valorFinal - totalInvestido;

      this.el.simResultBox.innerHTML = `
        <h4 style="color: var(--primary); margin-bottom: 0.5rem;">Resultado do Investimento</h4>
        <p>Total Investido: <strong>${this.formatCurrency(totalInvestido)}</strong></p>
        <p>Juros Acumulados: <strong style="color: var(--success);">${this.formatCurrency(jurosGanhos)}</strong></p>
        <p style="font-size: 1.1rem; margin-top: 0.5rem;">Valor Final Futuro: <strong style="color: var(--success);">${this.formatCurrency(valorFinal)}</strong></p>
      `;
    } else {
      // Financiamento Price
      if (isNaN(v1) || isNaN(v2) || isNaN(valInitial)) {
        alert('Preencha Taxa Mensal, Prazo e Valor Financiado.');
        return;
      }

      const pv = valInitial;
      const i = v1 / 100; // taxa mensal
      const n = v2; // prazo em meses
      const carencia = isNaN(v3) ? 0 : v3;

      if (i === 0) {
        const pmt = pv / n;
        this.el.simResultBox.innerHTML = `
          <h4 style="color: var(--primary); margin-bottom: 0.5rem;">Resultado do Financiamento</h4>
          <p>Prestação Mensal (Sem Juros): <strong>${this.formatCurrency(pmt)}</strong></p>
          <p>Total a Pagar: <strong>${this.formatCurrency(pv)}</strong></p>
        `;
      } else {
        // PMT = PV * (i * (1+i)^n) / ((1+i)^n - 1)
        let ajustedPv = pv;
        
        // Se houver carência com incorporação de juros
        if (carencia > 0) {
          ajustedPv = pv * Math.pow(1 + i, carencia);
        }

        const pmt = ajustedPv * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
        const totalPagar = pmt * n;
        const jurosPagos = totalPagar - pv;

        this.el.simResultBox.innerHTML = `
          <h4 style="color: var(--primary); margin-bottom: 0.5rem;">Resultado da Tabela Price</h4>
          <p>Prestação Mensal: <strong style="color: var(--danger);">${this.formatCurrency(pmt)}</strong></p>
          <p>Juros Pagos no Período: <strong>${this.formatCurrency(jurosPagos)}</strong></p>
          <p style="font-size: 1.1rem; margin-top: 0.5rem;">Total Final Pago: <strong style="color: var(--danger);">${this.formatCurrency(totalPagar)}</strong></p>
          ${carencia > 0 ? `<small style="color: var(--text-muted); display:block; margin-top:0.4rem;">* Saldo devedor inicial acumulou juros durante a carência de ${carencia} meses.</small>` : ''}
        `;
      }
    }
    this.el.simResultBox.style.display = 'block';
  },

  // --- SISTEMA DE ALERTAS E NOTIFICAÇÕES ---
  async generateAlerts() {
    this.notifications = [];
    
    // 1. Verificar Metas diárias incompletas do dia de hoje
    const todayStr = new Date().toISOString().split('T')[0];
    const goals = await DataService.loadGoals(todayStr);
    
    if (goals.length > 0) {
      const aguaGoal = goals.find(g => g.tipo === 'agua');
      if (aguaGoal && parseFloat(aguaGoal.progresso_valor) < parseFloat(aguaGoal.meta_valor)) {
        this.notifications.push(`💧 Lembre-se de beber água! Você consumiu apenas ${aguaGoal.progresso_valor}ml da meta de ${aguaGoal.meta_valor}ml.`);
      }
      
      const estudosGoal = goals.find(g => g.tipo === 'estudos');
      if (estudosGoal && parseFloat(estudosGoal.progresso_valor) < parseFloat(estudosGoal.meta_valor)) {
        this.notifications.push(`📚 Hora de focar! Meta de estudos ainda pendente para hoje.`);
      }
    }

    // 2. Verificar tarefas pendentes do dia atual da semana
    const weekdayNames = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const currentDayName = weekdayNames[new Date().getDay()];
    
    const tasks = await DataService.loadTasks(currentDayName);
    const pendingTasksCount = tasks.filter(t => t.status === 'pendente').length;
    if (pendingTasksCount > 0) {
      this.notifications.push(`📅 Você tem ${pendingTasksCount} tarefa(s) pendente(s) na agenda de hoje.`);
    }

    // 3. Notificação fixa de contas a vencer
    this.notifications.push('💰 Lembrete: Contas recorrentes e faturas mensais agendadas para o final do ciclo.');

    this.renderAlerts();
  },

  renderAlerts() {
    const badge = this.el.notifBadge;
    const list = this.el.notifList;
    
    if (this.notifications.length === 0) {
      badge.style.display = 'none';
      list.innerHTML = '<p class="notif-empty">Nenhum aviso pendente.</p>';
      return;
    }

    badge.style.display = 'inline-block';
    badge.textContent = this.notifications.length;

    list.innerHTML = this.notifications.map((notif, index) => `
      <div class="notif-item" style="padding: 0.8rem; border-bottom: 1px solid var(--border); font-size: 0.85rem; line-height: 1.4; display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
        <span>${notif}</span>
        <button onclick="App.removeAlert(${index})" style="background:none; border:none; color: var(--text-muted); cursor:pointer; font-size:0.8rem;">✕</button>
      </div>
    `).join('');
  },

  removeAlert(index) {
    this.notifications.splice(index, 1);
    this.renderAlerts();
  },

  // --- UTILS ---
  formatCurrency(value) {
    return `R$ ${(value || 0).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  },

  formatDate(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
