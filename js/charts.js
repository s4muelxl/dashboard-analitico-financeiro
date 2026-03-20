const ChartService = {
  pieChart: null,
  barChart: null,
  lineChart: null,
  pizzaIncomeChart: null,

  colors: [
    '#fbbf24', '#f59e0b', '#d97706', '#10b981', '#059669',
    '#3b82f6', '#2563eb', '#8b5cf6', '#6366f1', '#ec4899'
  ],

  defaultOptions: {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { size: 12 } }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: '#475569',
        borderWidth: 1,
        callbacks: {
          label(ctx) {
            const value = ctx.raw || ctx.parsed;
            const formatted = typeof value === 'number'
              ? `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
              : value;
            return ` ${ctx.label}: ${formatted}`;
          }
        }
      }
    }
  },

  formatCurrency(value) {
    return `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  },

  renderPieChart(ctxId, chartRef, data, isIncome) {
    const ctx = document.getElementById(ctxId);
    if (!ctx) return;

    if (this[chartRef]) this[chartRef].destroy();

    const labels = Object.keys(data);
    const values = Object.values(data).map(v => Math.round(v * 100) / 100);
    
    // Different shade array depending on income/expense for better visuals
    const bgColors = isIncome 
      ? ['#10b981', '#34d399', '#059669', '#047857', '#065f46']  // Greens
      : ['#ef4444', '#f87171', '#dc2626', '#b91c1c', '#7f1d1d']; // Reds

    this[chartRef] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: bgColors.slice(0, labels.length),
          borderWidth: 0,
          hoverOffset: 8
        }]
      },
      options: {
        ...this.defaultOptions,
        cutout: '60%',
        plugins: {
          ...this.defaultOptions.plugins,
          legend: {
            ...this.defaultOptions.plugins.legend,
            position: 'bottom'
          }
        }
      }
    });
  },

  renderBarChart(income, expense) {
    const ctx = document.getElementById('chart-bar');
    if (!ctx) return;

    if (this.barChart) this.barChart.destroy();

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Receitas', 'Despesas'],
        datasets: [{
          data: [income, expense],
          backgroundColor: ['#10b981', '#ef4444'],
          borderRadius: 8,
          barThickness: 60
        }]
      },
      options: {
        ...this.defaultOptions,
        plugins: {
          ...this.defaultOptions.plugins,
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8' }
          },
          y: {
            grid: { color: '#334155' },
            ticks: {
              color: '#94a3b8',
              callback(value) {
                return `R$ ${(value / 1000).toFixed(0)}k`;
              }
            }
          }
        }
      }
    });
  },

  renderLineChart(monthlyData) {
    const ctx = document.getElementById('chart-line');
    if (!ctx) return;

    if (this.lineChart) this.lineChart.destroy();

    const labels = monthlyData.map(d => {
      const [year, month] = d.month.split('-');
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return `${monthNames[parseInt(month) - 1]}/${year.slice(2)}`;
    });

    this.lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Receitas',
            data: monthlyData.map(d => d.income),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Despesas',
            data: monthlyData.map(d => d.expense),
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        ...this.defaultOptions,
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          x: {
            grid: { color: '#334155' },
            ticks: { color: '#94a3b8' }
          },
          y: {
            grid: { color: '#334155' },
            ticks: {
              color: '#94a3b8',
              callback(value) {
                return `R$ ${(value / 1000).toFixed(0)}k`;
              }
            }
          }
        }
      }
    });
  },

  updateAllCharts(transactions) {
    const expenses = transactions.filter(t => t.type === 'expense');
    const incomes = transactions.filter(t => t.type === 'income');
    
    const expensesByCategory = FilterService.groupByCategory(expenses);
    const incomesByCategory = FilterService.groupByCategory(incomes);
    
    const totals = FilterService.calculateTotals(transactions);
    const monthly = FilterService.groupByMonth(transactions);

    this.renderPieChart('chart-pie', 'pieChart', expensesByCategory, false);
    this.renderPieChart('chart-pie-income', 'pizzaIncomeChart', incomesByCategory, true);
    this.renderBarChart(totals.income, totals.expense);
    this.renderLineChart(monthly);
  }
};
