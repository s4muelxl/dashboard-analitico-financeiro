const FilterService = {
  filterByPeriod(transactions, period) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return transactions.filter(t => {
      const txDate = new Date(t.date);
      switch (period) {
        case 'current-month':
          return txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;
        case 'last-month':
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          return txDate.getFullYear() === lastMonthYear && txDate.getMonth() === lastMonth;
        case 'last-3-months':
          const threeMonthsAgo = new Date(now);
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          return txDate >= threeMonthsAgo;
        case 'current-year':
          return txDate.getFullYear() === currentYear;
        default:
          return true;
      }
    });
  },

  filterByCategory(transactions, category) {
    if (category === 'all') return transactions;
    return transactions.filter(t => t.category === category);
  },

  filterByType(transactions, type) {
    if (type === 'all') return transactions;
    return transactions.filter(t => t.type === type);
  },

  filterBySearch(transactions, query) {
    if (!query || query.trim() === '') return transactions;
    const lowerQuery = query.toLowerCase();
    return transactions.filter(t => t.description.toLowerCase().includes(lowerQuery));
  },

  sortTransactions(transactions, sortBy) {
    return transactions.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return new Date(b.date) - new Date(a.date);
    });
  },

  applyFilters(transactions, filters) {
    let result = [...transactions];
    result = this.filterBySearch(result, filters.search);
    result = this.filterByPeriod(result, filters.period);
    result = this.filterByCategory(result, filters.category);
    result = this.filterByType(result, filters.type);
    return this.sortTransactions(result, filters.sortBy || 'date-desc');
  },

  calculateTotals(transactions) {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      income: Math.round(income * 100) / 100,
      expense: Math.round(expense * 100) / 100,
      balance: Math.round((income - expense) * 100) / 100
    };
  },

  groupByCategory(transactions) {
    const grouped = {};
    transactions.forEach(t => {
      if (!grouped[t.category]) {
        grouped[t.category] = 0;
      }
      grouped[t.category] += t.amount;
    });
    return grouped;
  },

  groupByMonth(transactions) {
    const grouped = {};
    transactions.forEach(t => {
      const key = t.date.substring(0, 7);
      if (!grouped[key]) {
        grouped[key] = { income: 0, expense: 0 };
      }
      grouped[key][t.type] += t.amount;
    });
    return Object.keys(grouped)
      .sort()
      .map(key => ({
        month: key,
        income: Math.round(grouped[key].income * 100) / 100,
        expense: Math.round(grouped[key].expense * 100) / 100
      }));
  },

  getUniqueCategories(transactions) {
    const cats = new Set(transactions.map(t => t.category));
    return [...cats].sort();
  }
};
