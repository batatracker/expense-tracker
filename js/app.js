// ============================================================
// app.js — Main Alpine.js component
// All app state and methods live here.
// ============================================================

function appData() {
  return {

    // ==================  SETUP  ==================
    isSetupNeeded: false,
    setupForm: { clientId: '', sheetId: '', defaultCurrency: '' },
    setupErrors: {},

    // ==================  AUTH  ==================
    isInitializing: true,
    isAuthenticated: false,
    user: null,         // { name, email, picture, sub }

    // ==================  NAVIGATION  ==================
    currentView: 'dashboard',
    previousView: null,

    // ==================  DATA  ==================
    sheetId: null,
    expenses: [],
    isLoading: false,

    // ==================  FORM  ==================
    isEditing: false,
    form: {
      id: null,
      amount: '',
      currency: '',   // populated from defaultCurrency on openAddExpense()
      date: '',
      category: '',
      customCategory: '',
      merchant: '',
      notes: '',
    },
    formErrors: {},
    formDirty: false,
    isSaving: false,

    // Receipt
    receiptFile: null,
    receiptPreviewUrl: null,
    receiptFileName: null,
    existingReceiptUrl: '',

    // ==================  LIST  ==================
    search: '',
    filterCategories: [],
    filterStart: '',
    filterEnd: '',
    sortBy: 'date-desc',
    showFilters: false,

    // ==================  DETAIL  ==================
    selectedExpense: null,
    showDetail: false,
    showDeleteConfirm: false,
    isDeleting: false,

    // ==================  DASHBOARD  ==================
    dashPeriod: 'this-month',

    // ==================  TOAST  ==================
    toastMessage: '',
    toastType: 'success',
    toastVisible: false,
    _toastTimer: null,

    // ==================  SETTINGS  ==================
    defaultCurrency: '',   // empty = currency-agnostic; user sets in Settings

    // ==============================================
    //  INIT
    // ==============================================

    // --------------------------------------------------
    //  URL config: encode/decode setup values into ?cfg=
    //  so a bookmarked URL survives localStorage wipes.
    // --------------------------------------------------
    _loadConfigFromUrl() {
      try {
        const param = new URLSearchParams(window.location.search).get('cfg');
        if (!param) return false;
        const cfg = JSON.parse(atob(param));
        if (cfg.clientId)  localStorage.setItem('et_client_id', cfg.clientId);
        if (cfg.sheetId)   localStorage.setItem('et_sheet_id',  cfg.sheetId);
        if (cfg.currency)  localStorage.setItem('et_settings',  JSON.stringify({ defaultCurrency: cfg.currency }));
        return true;
      } catch { return false; }
    },

    _buildConfigUrl(clientId, sheetId, currency) {
      const cfg = {};
      if (clientId) cfg.clientId = clientId;
      if (sheetId)  cfg.sheetId  = sheetId;
      if (currency) cfg.currency = currency;
      const encoded = btoa(JSON.stringify(cfg));
      const url = new URL(window.location.href);
      url.searchParams.set('cfg', encoded);
      // Keep any existing hash (route)
      return url.toString();
    },

    async init() {
      // Check URL for ?cfg= param — restores config after localStorage wipe.
      this._loadConfigFromUrl();

      // Guard: require a Client ID before doing anything else.
      // Checked from localStorage (set via setup screen) OR from config.js.
      const clientId = localStorage.getItem('et_client_id') || CONFIG.GOOGLE_CLIENT_ID;
      if (!clientId) {
        this.isSetupNeeded = true;
        this.isInitializing = false;
        return;
      }

      // Restore settings
      try {
        const saved = JSON.parse(localStorage.getItem('et_settings') || '{}');
        if (saved.defaultCurrency !== undefined) this.defaultCurrency = saved.defaultCurrency;
      } catch {}

      this.form.currency = this.defaultCurrency;
      this.sheetId = localStorage.getItem('et_sheet_id') || null;

      // Init GIS auth
      await Auth.init();

      // Restore session token
      const savedToken = sessionStorage.getItem('et_token');
      if (savedToken) {
        Auth.setToken(savedToken);
        const info = await Auth.fetchUserInfo();
        if (info) {
          this.user = info;
          this.isAuthenticated = true;
          await this._setupSheetAndLoad();
        } else {
          sessionStorage.removeItem('et_token');
        }
      }

      this.isInitializing = false;

      // Watch dashboard view → init/update charts
      this.$watch('currentView', (view) => {
        if (view === 'dashboard') {
          this.$nextTick(() => this.initCharts());
        }
      });
      this.$watch('dashPeriod', () => {
        if (this.currentView === 'dashboard') {
          this.$nextTick(() => this.initCharts());
        }
      });
      this.$watch('expenses', () => {
        if (this.currentView === 'dashboard') {
          this.$nextTick(() => this.initCharts());
        }
      }, { deep: false });

      // Hash routing
      window.addEventListener('hashchange', () => this._handleHash());
      this._handleHash();

      // Pull-to-refresh on expense list
      this._initPullToRefresh();
    },

    _initPullToRefresh() {
      let startY = 0;
      let isPulling = false;
      const el = document.querySelector('.view-container');
      if (!el) return;

      el.addEventListener('touchstart', (e) => {
        if (el.scrollTop === 0) startY = e.touches[0].clientY;
      }, { passive: true });

      el.addEventListener('touchmove', (e) => {
        if (!startY) return;
        const dy = e.touches[0].clientY - startY;
        if (dy > 60 && el.scrollTop === 0) {
          isPulling = true;
        }
      }, { passive: true });

      el.addEventListener('touchend', async () => {
        if (isPulling) {
          await this.refreshExpenses();
        }
        isPulling = false;
        startY = 0;
      }, { passive: true });
    },

    _handleHash() {
      const hash = window.location.hash.replace('#/', '');
      const valid = ['dashboard', 'expenses', 'settings'];
      if (valid.includes(hash)) this.currentView = hash;
    },

    // ==============================================
    //  AUTH
    // ==============================================

    async signIn() {
      try {
        const { token, userInfo } = await Auth.signIn();
        sessionStorage.setItem('et_token', token);
        this.user = userInfo;
        this.isAuthenticated = true;
        await this._setupSheetAndLoad();
        this.showToast(`Welcome, ${userInfo.given_name || userInfo.name}!`, 'success');
      } catch (err) {
        console.error('Sign-in error:', err);
        this.showToast('Sign-in failed. Please try again.', 'error');
      }
    },

    signOut() {
      Auth.signOut();
      this.isAuthenticated = false;
      this.user = null;
      this.expenses = [];
      this.sheetId = null;
      this.currentView = 'dashboard';
      if (window._categoryChart) { window._categoryChart.destroy(); window._categoryChart = null; }
      if (window._trendChart)    { window._trendChart.destroy();    window._trendChart = null; }
    },

    // ==============================================
    //  SETUP
    // ==============================================

    saveSetup() {
      const errors = {};
      const id = this.setupForm.clientId.trim();
      if (!id) {
        errors.clientId = 'Please enter your Google OAuth Client ID.';
      }
      this.setupErrors = errors;
      if (Object.keys(errors).length > 0) return;

      localStorage.setItem('et_client_id', id);
      // Optional: pre-set default currency
      const cur = this.setupForm.defaultCurrency.trim().toUpperCase();
      if (cur) {
        localStorage.setItem('et_settings', JSON.stringify({ defaultCurrency: cur }));
      }
      // Optional: pre-register an existing Sheet ID
      const sid = this.setupForm.sheetId.trim();
      if (sid) {
        localStorage.setItem('et_sheet_id', sid);
      }
      // Encode config into URL so a bookmarked link survives localStorage wipes.
      // Navigate to that URL (also causes a reload so auth.js picks up the new Client ID).
      window.location.href = this._buildConfigUrl(id, sid || null, cur || null);
    },

    clearClientId() {
      if (!confirm('Remove the saved Client ID? You will need to re-enter it.')) return;
      localStorage.removeItem('et_client_id');
      // Also remove the ?cfg= param so bookmarked URL no longer auto-restores.
      const url = new URL(window.location.href);
      url.searchParams.delete('cfg');
      window.location.href = url.toString();
    },

    get maskedClientId() {
      const id = localStorage.getItem('et_client_id') || '';
      if (!id) return '';
      return id.length > 24 ? id.slice(0, 12) + '…' + id.slice(-8) : id;
    },

    // ==============================================
    //  AUTH (continued)
    // ==============================================

    handleAuthError() {
      sessionStorage.removeItem('et_token');
      this.showToast('Session expired — please sign in again.', 'warning');
      this.isAuthenticated = false;
      this.user = null;
      this.expenses = [];
    },

    // ==============================================
    //  SHEET SETUP
    // ==============================================

    async _setupSheetAndLoad() {
      await this._ensureSheet();
      await this.loadExpenses();
    },

    async _ensureSheet() {
      try {
        this.sheetId = await Sheets.findOrCreateSheet(this.sheetId);
        localStorage.setItem('et_sheet_id', this.sheetId);
      } catch (err) {
        if (err.status === 401) { this.handleAuthError(); return; }
        console.error('Sheet setup error:', err);
      }
    },

    // ==============================================
    //  DATA
    // ==============================================

    async loadExpenses() {
      if (!this.sheetId) await this._ensureSheet();
      if (!this.sheetId) return;
      this.isLoading = true;
      try {
        this.expenses = await Sheets.readAllExpenses(this.sheetId);
      } catch (err) {
        if (err.status === 401) { this.handleAuthError(); return; }
        if (err.status === 404) {
          localStorage.removeItem('et_sheet_id');
          this.sheetId = null;
          await this._ensureSheet();
          this.expenses = [];
        } else {
          this.showToast('Failed to load expenses.', 'error');
        }
      } finally {
        this.isLoading = false;
      }
    },

    async refreshExpenses() {
      await this.loadExpenses();
      this.showToast('Expenses refreshed.', 'success');
    },

    // ==============================================
    //  COMPUTED (getters)
    // ==============================================

    get filteredExpenses() {
      let result = [...this.expenses];

      if (this.search.trim()) {
        const q = this.search.toLowerCase();
        result = result.filter((e) =>
          (e.merchant || '').toLowerCase().includes(q) ||
          (e.notes    || '').toLowerCase().includes(q) ||
          (e.category || '').toLowerCase().includes(q)
        );
      }

      if (this.filterCategories.length > 0) {
        result = result.filter((e) => this.filterCategories.includes(e.category));
      }

      if (this.filterStart) result = result.filter((e) => e.date >= this.filterStart);
      if (this.filterEnd)   result = result.filter((e) => e.date <= this.filterEnd);

      result.sort((a, b) => {
        switch (this.sortBy) {
          case 'date-desc':   return b.date.localeCompare(a.date);
          case 'date-asc':    return a.date.localeCompare(b.date);
          case 'amount-desc': return parseFloat(b.amount) - parseFloat(a.amount);
          case 'amount-asc':  return parseFloat(a.amount) - parseFloat(b.amount);
          default:            return 0;
        }
      });

      return result;
    },

    get hasActiveFilters() {
      return this.filterCategories.length > 0 || !!this.filterStart || !!this.filterEnd;
    },

    get activeFilterCount() {
      return (this.filterCategories.length > 0 ? 1 : 0) +
             (this.filterStart ? 1 : 0) +
             (this.filterEnd   ? 1 : 0);
    },

    // ==============================================
    //  NAVIGATION
    // ==============================================

    navigate(view) {
      if (this.formDirty && this.currentView === 'add') {
        if (!confirm('Discard unsaved changes?')) return;
        this.formDirty = false;
      }
      if (view === 'add') {
        this.openAddExpense();
        return;
      }
      this.previousView = this.currentView;
      this.currentView = view;
      window.location.hash = '/' + view;
    },

    goBack() {
      if (this.formDirty && !confirm('Discard unsaved changes?')) return;
      this.formDirty = false;
      const dest = this.previousView || 'expenses';
      this.currentView = dest;
      window.location.hash = '/' + dest;
    },

    // ==============================================
    //  EXPENSE FORM
    // ==============================================

    openAddExpense() {
      this.isEditing = false;
      this.form = {
        id: null,
        amount: '',
        currency: this.defaultCurrency,
        date: new Date().toISOString().split('T')[0],
        category: '',
        customCategory: '',
        merchant: '',
        notes: '',
      };
      this.formErrors = {};
      this.formDirty = false;
      this.receiptFile = null;
      this.receiptPreviewUrl = null;
      this.receiptFileName = null;
      this.existingReceiptUrl = '';
      this.previousView = this.currentView === 'add' ? 'expenses' : this.currentView;
      this.currentView = 'add';
    },

    openEditExpense(expense) {
      this.isEditing = true;
      const isPreset = CONFIG.CATEGORIES.includes(expense.category);
      this.form = {
        id:             expense.id,
        amount:         String(parseFloat(expense.amount || 0)),
        currency:       expense.currency || this.defaultCurrency,
        date:           expense.date,
        category:       isPreset ? expense.category : 'Other',
        customCategory: isPreset ? '' : expense.category,
        merchant:       expense.merchant || '',
        notes:          expense.notes || '',
      };
      this.formErrors = {};
      this.formDirty = false;
      this.receiptFile = null;
      this.receiptPreviewUrl = null;
      this.receiptFileName = null;
      this.existingReceiptUrl = expense.receiptUrl || '';
      this.showDetail = false;
      this.previousView = 'expenses';
      this.currentView = 'add';
    },

    validateForm() {
      const errors = {};
      const amount = parseFloat(this.form.amount);
      if (!this.form.amount || isNaN(amount) || amount <= 0) {
        errors.amount = 'Please enter a valid positive amount.';
      }
      if (!this.form.category) {
        errors.category = 'Please select a category.';
      }
      if (this.form.category === 'Other' && !this.form.customCategory.trim()) {
        errors.customCategory = 'Please enter a custom category name.';
      }
      this.formErrors = errors;
      return Object.keys(errors).length === 0;
    },

    async saveExpense() {
      if (!this.validateForm()) return;
      this.isSaving = true;

      const category = this.form.category === 'Other'
        ? this.form.customCategory.trim()
        : this.form.category;

      let receiptUrl = this.existingReceiptUrl || '';

      // Upload receipt if a new file was selected
      if (this.receiptFile) {
        try {
          receiptUrl = await Drive.uploadReceipt(this.receiptFile, `${category}-${this.form.date}`);
        } catch (uploadErr) {
          console.warn('Receipt upload failed:', uploadErr);
          if (uploadErr.status === 401) { this.handleAuthError(); this.isSaving = false; return; }
          this.showToast('Expense saved, but receipt upload failed. Retry from the expense detail.', 'warning');
          receiptUrl = '';
        }
      }

      const origExpense = this.isEditing ? this.expenses.find((e) => e.id === this.form.id) : null;
      const expense = {
        id:         this.form.id || crypto.randomUUID(),
        date:       this.form.date,
        amount:     parseFloat(this.form.amount).toFixed(2),
        currency:   (this.form.currency || this.defaultCurrency).toUpperCase(),
        category,
        merchant:   this.form.merchant.trim(),
        notes:      this.form.notes.trim(),
        receiptUrl,
        createdAt:  origExpense ? origExpense.createdAt : new Date().toISOString(),
      };

      try {
        if (this.isEditing) {
          await Sheets.updateExpense(this.sheetId, expense);
          const idx = this.expenses.findIndex((e) => e.id === expense.id);
          if (idx >= 0) this.expenses.splice(idx, 1, expense);
          this.showToast('Expense updated.', 'success');
        } else {
          await Sheets.appendExpense(this.sheetId, expense);
          this.expenses.unshift(expense);
          this.showToast('Expense saved.', 'success');
        }
        this.formDirty = false;
        this.goBack();
      } catch (err) {
        if (err.status === 401) { this.handleAuthError(); return; }
        this.showToast('Failed to save. Please try again.', 'error');
        console.error('Save error:', err);
      } finally {
        this.isSaving = false;
      }
    },

    cancelForm() {
      if (this.formDirty && !confirm('Discard unsaved changes?')) return;
      this.formDirty = false;
      const dest = this.previousView || 'expenses';
      this.currentView = dest;
      window.location.hash = '/' + dest;
    },

    // ==============================================
    //  RECEIPT
    // ==============================================

    async handleFileSelect(event) {
      const file = event.target.files[0];
      if (!file) return;
      this.receiptFileName = file.name;
      this.formDirty = true;
      if (file.type.startsWith('image/')) {
        const compressed = await Drive.compressImage(file);
        this.receiptFile = compressed;
        const reader = new FileReader();
        reader.onload = (e) => { this.receiptPreviewUrl = e.target.result; };
        reader.readAsDataURL(compressed);
      } else {
        this.receiptFile = file;
        this.receiptPreviewUrl = null;
      }
      event.target.value = '';
    },

    removeReceipt() {
      this.receiptFile = null;
      this.receiptPreviewUrl = null;
      this.receiptFileName = null;
      this.existingReceiptUrl = '';
      this.formDirty = true;
    },

    async handleRetroactiveReceipt(event) {
      const file = event.target.files[0];
      if (!file || !this.selectedExpense) return;
      const expense = this.selectedExpense;
      event.target.value = '';
      try {
        const toUpload = file.type.startsWith('image/') ? await Drive.compressImage(file) : file;
        const receiptUrl = await Drive.uploadReceipt(toUpload, `${expense.category}-${expense.date}`);
        const updated = { ...expense, receiptUrl };
        await Sheets.updateExpense(this.sheetId, updated);
        const idx = this.expenses.findIndex((e) => e.id === expense.id);
        if (idx >= 0) this.expenses.splice(idx, 1, updated);
        this.selectedExpense = updated;
        this.showToast('Receipt added.', 'success');
      } catch (err) {
        if (err.status === 401) { this.handleAuthError(); return; }
        this.showToast('Receipt upload failed.', 'error');
      }
    },

    // ==============================================
    //  DETAIL / DELETE
    // ==============================================

    openDetail(expense) {
      this.selectedExpense = expense;
      this.showDetail = true;
      this.showDeleteConfirm = false;
    },

    closeDetail() {
      this.showDetail = false;
      this.selectedExpense = null;
      this.showDeleteConfirm = false;
    },

    async confirmDelete() {
      if (!this.selectedExpense) return;
      this.isDeleting = true;
      try {
        await Sheets.deleteExpense(this.sheetId, this.selectedExpense.id);
        this.expenses = this.expenses.filter((e) => e.id !== this.selectedExpense.id);
        this.closeDetail();
        this.showToast('Expense deleted.', 'success');
      } catch (err) {
        if (err.status === 401) { this.handleAuthError(); return; }
        this.showToast('Failed to delete. Please try again.', 'error');
      } finally {
        this.isDeleting = false;
      }
    },

    // ==============================================
    //  FILTERS
    // ==============================================

    toggleCategoryFilter(category) {
      const idx = this.filterCategories.indexOf(category);
      if (idx >= 0) this.filterCategories.splice(idx, 1);
      else this.filterCategories.push(category);
    },

    clearFilters() {
      this.filterCategories = [];
      this.filterStart = '';
      this.filterEnd = '';
      this.showFilters = false;
    },

    // ==============================================
    //  DASHBOARD
    // ==============================================

    _getDateRange(period) {
      const now = new Date();
      let from, to;
      switch (period) {
        case 'this-month':
          from = new Date(now.getFullYear(), now.getMonth(), 1);
          to   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case 'last-month':
          from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          to   = new Date(now.getFullYear(), now.getMonth(), 0);
          break;
        case 'last-3-months':
          from = new Date(now.getFullYear(), now.getMonth() - 2, 1);
          to   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case 'this-year':
          from = new Date(now.getFullYear(), 0, 1);
          to   = new Date(now.getFullYear(), 11, 31);
          break;
        default: // all-time
          from = null; to = null;
      }
      return {
        fromStr: from ? from.toISOString().split('T')[0] : null,
        toStr:   to   ? to.toISOString().split('T')[0]   : null,
      };
    },

    computeDashboardData() {
      const { fromStr, toStr } = this._getDateRange(this.dashPeriod);

      const filtered = this.expenses.filter((e) => {
        if (fromStr && e.date < fromStr) return false;
        if (toStr   && e.date > toStr)   return false;
        return true;
      });

      // Group totals by currency (preserves multi-currency accuracy)
      const rawByCurrency = {};
      const byCategory = {};
      for (const e of filtered) {
        const amt = parseFloat(e.amount || 0);
        const cur = (e.currency || this.defaultCurrency || '').toUpperCase();
        if (cur) rawByCurrency[cur] = (rawByCurrency[cur] || 0) + amt;
        byCategory[e.category] = (byCategory[e.category] || 0) + amt;
      }

      // Sorted array for easy template iteration; primary = highest total
      const currencyTotals = Object.keys(rawByCurrency)
        .map((currency) => ({ currency, total: rawByCurrency[currency] }))
        .sort((a, b) => b.total - a.total);

      const primaryCurrency = currencyTotals[0]?.currency || this.defaultCurrency || '';
      const isMultiCurrency  = currencyTotals.length > 1;

      // 6-month rolling trend — use primary currency expenses only (meaningful chart)
      const now = new Date();
      const monthTrend = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthTotal = this.expenses
          .filter((e) => {
            if (!e.date || !e.date.startsWith(monthStr)) return false;
            // If there are multiple currencies, show only the primary one in the trend
            if (isMultiCurrency) {
              const cur = (e.currency || this.defaultCurrency || '').toUpperCase();
              return cur === primaryCurrency;
            }
            return true;
          })
          .reduce((s, e) => s + parseFloat(e.amount || 0), 0);
        monthTrend.push({
          label: d.toLocaleString('default', { month: 'short' }),
          total: monthTotal,
        });
      }

      const recent = [...this.expenses]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5);

      return { currencyTotals, primaryCurrency, isMultiCurrency, byCategory, monthTrend, recent };
    },

    initCharts() {
      const data = this.computeDashboardData();

      // --- Category donut ---
      const catEl = document.getElementById('category-chart');
      if (catEl) {
        if (window._categoryChart) window._categoryChart.destroy();
        const categories = Object.keys(data.byCategory);
        const amounts    = categories.map((c) => data.byCategory[c]);
        const colors     = categories.map((c) => CONFIG.CATEGORY_COLORS[c] || '#9CA3AF');
        const isEmpty    = categories.length === 0;

        window._categoryChart = new Chart(catEl, {
          type: 'doughnut',
          data: {
            labels:   isEmpty ? ['No data'] : categories,
            datasets: [{
              data:            isEmpty ? [1] : amounts,
              backgroundColor: isEmpty ? ['#E5E7EB'] : colors,
              borderWidth:     0,
              hoverOffset:     6,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '68%',
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  font:     { family: 'Inter, system-ui, sans-serif', size: 11 },
                  color:    '#6B7280',
                  padding:  10,
                  boxWidth: 10,
                  boxHeight: 10,
                },
              },
              tooltip: {
                enabled: !isEmpty,
                callbacks: {
                  label: (ctx) => {
                    const tot = ctx.dataset.data.reduce((s, v) => s + v, 0);
                    const pct = tot > 0 ? Math.round((ctx.raw / tot) * 100) : 0;
                    return ` ${ctx.label}: ${this.formatCurrency(ctx.raw, data.primaryCurrency)} (${pct}%)`;
                  },
                },
              },
            },
          },
        });
      }

      // --- Monthly trend bar ---
      const trendEl = document.getElementById('trend-chart');
      if (trendEl) {
        if (window._trendChart) window._trendChart.destroy();
        window._trendChart = new Chart(trendEl, {
          type: 'bar',
          data: {
            labels: data.monthTrend.map((m) => m.label),
            datasets: [{
              data:            data.monthTrend.map((m) => m.total),
              backgroundColor: '#5B4FE9',
              borderRadius:    6,
              borderSkipped:   false,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => ` ${this.formatCurrency(ctx.raw, data.primaryCurrency)}`,
                },
              },
            },
            scales: {
              x: {
                grid:  { display: false },
                ticks: { font: { family: 'Inter, system-ui, sans-serif', size: 11 }, color: '#9CA3AF' },
              },
              y: {
                grid:  { color: '#F1F4F9', drawBorder: false },
                ticks: {
                  font:     { family: 'Inter, system-ui, sans-serif', size: 11 },
                  color:    '#9CA3AF',
                  callback: (v) => this.formatCurrencyCompact(v, data.primaryCurrency),
                },
              },
            },
          },
        });
      }
    },

    get dashboardSummary() {
      return this.computeDashboardData();
    },

    // ==============================================
    //  SETTINGS
    // ==============================================

    saveSettings() {
      localStorage.setItem('et_settings', JSON.stringify({ defaultCurrency: this.defaultCurrency }));
      this.showToast('Settings saved.', 'success');
    },

    openSheet() {
      if (this.sheetId) window.open(`https://docs.google.com/spreadsheets/d/${this.sheetId}`, '_blank');
    },

    async relinkSheet() {
      if (!confirm('This will create or re-link your Google Sheet. Continue?')) return;
      localStorage.removeItem('et_sheet_id');
      this.sheetId = null;
      await this._ensureSheet();
      await this.loadExpenses();
      this.showToast('Sheet re-linked.', 'success');
    },

    get sheetUrl() {
      return this.sheetId
        ? `https://docs.google.com/spreadsheets/d/${this.sheetId}`
        : '#';
    },

    // ==============================================
    //  UTILITIES
    // ==============================================

    showToast(message, type = 'success') {
      clearTimeout(this._toastTimer);
      this.toastMessage = message;
      this.toastType    = type;
      this.toastVisible = true;
      this._toastTimer  = setTimeout(() => { this.toastVisible = false; }, 3500);
    },

    formatCurrency(amount, currency) {
      const num = parseFloat(amount) || 0;
      const cur = (currency || this.defaultCurrency || '').toUpperCase();
      if (!cur) {
        // No currency info — render as a plain decimal number
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2, maximumFractionDigits: 2,
        }).format(num);
      }
      try {
        return new Intl.NumberFormat('en-US', {
          style: 'currency', currency: cur,
          minimumFractionDigits: 2, maximumFractionDigits: 2,
        }).format(num);
      } catch {
        // Unknown currency code — prefix manually
        return `${cur} ${num.toFixed(2)}`;
      }
    },

    formatCurrencyCompact(amount, currency) {
      const num = parseFloat(amount) || 0;
      const cur = (currency || this.defaultCurrency || '').toUpperCase();
      if (!cur) {
        if (num === 0) return '0';
        return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : String(Math.round(num));
      }
      try {
        return new Intl.NumberFormat('en-US', {
          style: 'currency', currency: cur,
          notation: 'compact', maximumFractionDigits: 1,
        }).format(num);
      } catch {
        return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : String(Math.round(num));
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return '';
      try {
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
        });
      } catch { return dateStr; }
    },

    formatDateShort(dateStr) {
      if (!dateStr) return '';
      try {
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
          month: 'short', day: 'numeric',
        });
      } catch { return dateStr; }
    },

    getCategoryIcon(category) {
      return CONFIG.CATEGORY_ICONS[category] || CONFIG.CATEGORY_ICONS['Other'];
    },

    getCategoryColor(category) {
      return CONFIG.CATEGORY_COLORS[category] || '#9CA3AF';
    },

    get categories() {
      return CONFIG.CATEGORIES;
    },

    get appVersion() {
      return CONFIG.APP_VERSION;
    },

    get repoUrl() {
      return CONFIG.REPO_URL;
    },
  };
}
