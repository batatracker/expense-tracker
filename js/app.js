// ============================================================
// app.js — Main Alpine.js component
// All app state and methods live here.
// ============================================================

function appData() {
  return {

    // ==================  SETUP  ==================
    isSetupNeeded: false,
    setupMode: null,   // null → pick mode; 'fresh' → auto-create sheet; 'existing' → paste link; 'appscript' → no OAuth
    setupForm: { clientId: '', spreadsheetUrl: '', defaultCurrency: '', scriptUrl: '' },
    setupErrors: {},
    appMode: 'oauth',       // 'oauth' | 'appscript'
    scriptUrl: null,
    setupStep: 1,           // wizard step for appscript mode
    setupVerifying: false,

    // ==================  AUTH  ==================
    isInitializing: true,
    isAuthenticated: false,
    user: null,         // { name, email, picture, sub }

    // ==================  NAVIGATION  ==================
    currentView: 'dashboard',
    previousView: null,

    // ==================  DATA  ==================
    sheetId: null,
    sheetDisplayUrl: null,       // resolved for appscript mode; built from sheetId for oauth
    sheetUrlInput: '',           // temp input for manual paste in Settings
    sheetUrlFetchFailed: false,  // true when getSheetUrl() fails (old deployment needs update)
    scriptOutdated: false,       // true when deployed script version < CONFIG.SCRIPT_VERSION
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

    // ==================  INCOME  ==================
    income: [],
    _incomeTabEnsured: false,

    // Income entry form
    incomeForm: {
      id: null,
      source: '',
      amount: '',
      currency: '',
      date: '',
      notes: '',
      isLoan: false,
      loanId: null,
    },
    incomeFormErrors: {},
    showIncomeForm: false,
    isSavingIncome: false,

    // Reconciliation form
    reconcileForm: {
      amount: '',
      date: '',
      notes: '',
    },
    reconcileFormErrors: {},
    showReconcileForm: false,
    isSavingReconcile: false,
    reconcileTrackedBalance: 0,

    // Delete state for income entries
    _incomeDeleteConfirm: null,

    // ==================  DEBTS  ==================
    debts: [],
    debtPayments: {},      // keyed by debtId → array of payments
    showPaidDebts: false,
    _debtTabsEnsured: false,

    // Debt form state
    debtForm: {
      id: null,
      source: '',
      date: '',
      totalAmount: '',
      outstandingBalance: '',
      currency: '',
      notes: '',
      isLoan: false,
      loanId: null,
    },
    debtFormErrors: {},
    showDebtForm: false,
    isEditingDebt: false,
    isSavingDebt: false,

    // Payment form state
    paymentForm: {
      debtId: null,
      debtSource: '',
      outstandingBalance: 0,
      debtCurrency: '',
      amount: '',
      currency: '',
      date: '',
      notes: '',
    },
    paymentFormErrors: {},
    showPaymentForm: false,
    isSavingPayment: false,

    // Per-debt UI toggles
    _debtExpanded: {},      // keyed by source key
    _debtHistoryOpen: {},   // keyed by debt id

    // ==================  DASHBOARD  ==================
    dashPeriod: 'this-month',
    chartsOpen: true,

    // ==================  TOAST  ==================
    toastMessage: '',
    toastType: 'success',
    toastVisible: false,
    _toastTimer: null,

    // ==================  SETTINGS  ==================
    defaultCurrency: '',        // empty = currency-agnostic; user sets in Settings
    receiptUploadEnabled: false, // opt-in; requires drive.file scope
    darkMode: false,

    // ==================  BRANDING  ==================
    appTitle: '',         // custom app title; empty = use default ("Expense Tracker")
    appIcon: '',          // emoji (≤10 chars) OR base64 data-URI; empty = use default favicon
    _brandingIconUrl: '', // resolved PNG data-URI used for preview and favicon injection
    showEmojiPicker: false,

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
        // Unicode-safe decode (backward-compatible with ASCII-only encoded URLs).
        const cfg = JSON.parse(decodeURIComponent(atob(param).split('').map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')));
        if (cfg.clientId)  localStorage.setItem('et_client_id', cfg.clientId);
        if (cfg.sheetId)   localStorage.setItem('et_sheet_id',  cfg.sheetId);
        if (cfg.currency || cfg.receiptUpload !== undefined || cfg.appMode || cfg.scriptUrl) {
          const existing = JSON.parse(localStorage.getItem('et_settings') || '{}');
          if (cfg.currency)                   existing.defaultCurrency = cfg.currency;
          if (cfg.receiptUpload !== undefined) existing.receiptUpload   = cfg.receiptUpload;
          if (cfg.appMode)                    existing.appMode          = cfg.appMode;
          localStorage.setItem('et_settings', JSON.stringify(existing));
        }
        if (cfg.scriptUrl)  localStorage.setItem('et_script_url', cfg.scriptUrl);
        if (cfg.appTitle)  this.appTitle = cfg.appTitle;
        if (cfg.appIcon)   this.appIcon  = cfg.appIcon;
        return true;
      } catch { return false; }
    },

    _buildConfigUrl(clientId, sheetId, currency, receiptUpload, scriptUrl) {
      const cfg = {};
      if (clientId)                    cfg.clientId      = clientId;
      if (sheetId)                     cfg.sheetId       = sheetId;
      if (currency)                    cfg.currency      = currency;
      if (receiptUpload !== undefined) cfg.receiptUpload = receiptUpload;
      if (scriptUrl)                   cfg.scriptUrl     = scriptUrl;
      if (scriptUrl)                   cfg.appMode       = 'appscript';
      if (this.appTitle)               cfg.appTitle      = this.appTitle;
      if (this.appIcon)                cfg.appIcon       = this.appIcon;
      // Unicode-safe base64: handles emoji and other non-Latin1 characters.
      const json = JSON.stringify(cfg);
      const encoded = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/gi, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
      const url = new URL(window.location.href);
      url.searchParams.set('cfg', encoded);
      // Keep any existing hash (route)
      return url.toString();
    },

    // --------------------------------------------------
    //  Branding: apply custom title and favicon from URL config.
    //  Called once during init, after _loadConfigFromUrl().
    // --------------------------------------------------
    _applyBranding() {
      if (this.appTitle) {
        document.title = this.appTitle;
        const metaTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
        if (metaTitle) metaTitle.setAttribute('content', this.appTitle);
      }
      if (this.appIcon) {
        const dataUri = this._resolveIconDataUri(this.appIcon);
        if (dataUri) {
          this._brandingIconUrl = dataUri;
          this._injectFavicon(dataUri, this.appIcon.length > 10);
        }
      }
    },

    // Emoji (≤10 chars) → render to canvas → PNG data-URI.
    // Longer string → treat as a base64 data-URI and return as-is.
    _resolveIconDataUri(icon) {
      if (!icon) return '';
      if (icon.length <= 10) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 64; canvas.height = 64;
          const ctx = canvas.getContext('2d');
          ctx.font = '48px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(icon, 32, 36);
          return canvas.toDataURL('image/png');
        } catch { return ''; }
      }
      return icon; // already a data-URI
    },

    _injectFavicon(dataUri, isImage) {
      document.querySelectorAll('link[data-branding]').forEach(el => el.remove());
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = dataUri;
      link.setAttribute('data-branding', '1');
      document.head.appendChild(link);
      if (isImage) {
        const appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        appleLink.href = dataUri;
        appleLink.setAttribute('data-branding', '1');
        document.head.appendChild(appleLink);
      }
    },

    // Dark mode — called first to avoid flash (CSS anti-flash script handles
    // the very first paint; this syncs Alpine state with what CSS already applied).
    _applyDarkMode() {
      document.documentElement.setAttribute('data-theme', this.darkMode ? 'dark' : 'light');
    },
    initDarkMode() {
      const saved = localStorage.getItem('et_dark_mode');
      this.darkMode = saved === 'true' ||
        (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
      this._applyDarkMode();
    },
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      localStorage.setItem('et_dark_mode', this.darkMode);
      this._applyDarkMode();
    },

    async init() {
      // Apply saved theme immediately (syncs Alpine state; CSS already handled first paint).
      this.initDarkMode();

      // Check URL for ?cfg= param — restores config after localStorage wipe.
      this._loadConfigFromUrl();
      // Apply custom title/favicon from URL config before first render.
      this._applyBranding();

      // Read persisted appMode and scriptUrl
      const saved = JSON.parse(localStorage.getItem('et_settings') || '{}');
      if (saved.appMode) this.appMode = saved.appMode;
      this.scriptUrl = localStorage.getItem('et_script_url') || null;

      // AppScript mode — no OAuth needed
      if (this.appMode === 'appscript') {
        if (!this.scriptUrl) {
          this.isSetupNeeded = true;
          this.isInitializing = false;
          return;
        }
        // Load settings
        try {
          const s = JSON.parse(localStorage.getItem('et_settings') || '{}');
          if (s.defaultCurrency !== undefined) this.defaultCurrency = s.defaultCurrency;
          if (s.receiptUpload   !== undefined) this.receiptUploadEnabled = s.receiptUpload;
        } catch {}
        this.form.currency = this.defaultCurrency;
        AppScript.init(this.scriptUrl);
        this.isAuthenticated = true;
        this.isInitializing = false;
        await Promise.allSettled([
          this.loadExpenses(),
          this.loadDebts(),
          this.loadIncome(),
        ]);
        // Load cached sheet URL from localStorage first (works for existing deployments).
        this.sheetDisplayUrl = localStorage.getItem('et_sheet_display_url') || null;
        // Check script version and fetch sheet URL in parallel.
        AppScript.getScriptVersion()
          .then(ver => {
            if (ver < CONFIG.SCRIPT_VERSION) this.scriptOutdated = true;
          })
          .catch(() => {
            // If getScriptVersion fails entirely, treat as version 1 (pre-versioning).
            this.scriptOutdated = true;
          });
        // Then try to fetch from script (works for new deployments that support sheetUrl action).
        AppScript.getSheetUrl()
          .then(url => {
            if (url) {
              this.sheetDisplayUrl = url;
              localStorage.setItem('et_sheet_display_url', url);
            }
          })
          .catch(() => {
            // Only flag as failed if we also have nothing cached — old deployment needs update.
            if (!this.sheetDisplayUrl) this.sheetUrlFetchFailed = true;
          });
        // Wire watchers and hash routing (same as OAuth path)
        this.$watch('currentView', (view) => {
          if (view === 'dashboard') this.$nextTick(() => this.initCharts());
        });
        this.$watch('dashPeriod', () => {
          if (this.currentView === 'dashboard') this.$nextTick(() => this.initCharts());
        });
        this.$watch('expenses', () => {
          if (this.currentView === 'dashboard') this.$nextTick(() => this.initCharts());
        }, { deep: false });
        window.addEventListener('hashchange', () => this._handleHash());
        this._handleHash();
        // Charts won't auto-trigger if currentView was already 'dashboard' (watcher ignores no-ops)
        if (this.currentView === 'dashboard') this.$nextTick(() => this.initCharts());
        this._initPullToRefresh();
        return;
      }

      // Guard: require a Client ID before doing anything else.
      const clientId = localStorage.getItem('et_client_id');
      if (!clientId) {
        this.isSetupNeeded = true;
        this.isInitializing = false;
        return;
      }

      // Restore settings
      try {
        const s = JSON.parse(localStorage.getItem('et_settings') || '{}');
        if (s.defaultCurrency !== undefined) this.defaultCurrency = s.defaultCurrency;
        if (s.receiptUpload    !== undefined) this.receiptUploadEnabled = s.receiptUpload;
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
      // Charts won't auto-trigger if currentView was already 'dashboard' (watcher ignores no-ops)
      if (this.currentView === 'dashboard') this.$nextTick(() => this.initCharts());

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
        if (dy > 80 && el.scrollTop === 0) {
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
      const valid = ['dashboard', 'expenses', 'debts', 'income', 'settings'];
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
        this.showToast(t('toast.welcome').replace('{name}', userInfo.given_name || userInfo.name), 'success');
      } catch (err) {
        console.error('Sign-in error:', err);
        this.showToast(t('toast.sign_in_failed'), 'error');
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

    // Extract a Google Sheet ID from a full URL or a raw ID string.
    _parseSheetId(input) {
      const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
      if (match) return match[1];
      if (/^[a-zA-Z0-9_-]{20,}$/.test(input.trim())) return input.trim();
      return null;
    },

    saveSetup() {
      if (this.setupMode === 'appscript') {
        // scriptUrl already verified by verifyScript()
        const url = this.setupForm.scriptUrl.trim();
        const cur = this.setupForm.defaultCurrency.trim().toUpperCase();
        localStorage.setItem('et_script_url', url);
        localStorage.setItem('et_settings', JSON.stringify({ appMode: 'appscript', defaultCurrency: cur || '', receiptUpload: false }));
        window.location.href = this._buildConfigUrl(null, null, cur || null, false, url);
        return;
      }

      const errors = {};
      const clientId = this.setupForm.clientId.trim();
      if (!clientId) errors.clientId = 'Google OAuth Client ID is required.';

      let sheetId = null;
      if (this.setupMode === 'existing') {
        const raw = this.setupForm.spreadsheetUrl.trim();
        if (!raw) {
          errors.spreadsheetUrl = 'Please paste your Google Sheet URL or ID.';
        } else {
          sheetId = this._parseSheetId(raw);
          if (!sheetId) errors.spreadsheetUrl = 'Could not find a Sheet ID in that URL. Check the format.';
        }
      }

      this.setupErrors = errors;
      if (Object.keys(errors).length > 0) return;

      // Receipt upload is only available in fresh mode (requires Drive folder setup).
      const receiptUpload = this.setupMode === 'fresh';

      localStorage.setItem('et_client_id', clientId);
      const cur = this.setupForm.defaultCurrency.trim().toUpperCase();
      localStorage.setItem('et_settings', JSON.stringify({
        defaultCurrency: cur || '',
        receiptUpload,
      }));
      if (sheetId) localStorage.setItem('et_sheet_id', sheetId);

      // Embed config in URL so a bookmarked link survives localStorage wipes.
      window.location.href = this._buildConfigUrl(clientId, sheetId, cur || null, receiptUpload, null);
    },

    clearClientId() {
      if (!confirm(t('confirm.reset_connection'))) return;
      localStorage.removeItem('et_client_id');
      localStorage.removeItem('et_script_url');
      const s = JSON.parse(localStorage.getItem('et_settings') || '{}');
      delete s.appMode;
      localStorage.setItem('et_settings', JSON.stringify(s));
      const url = new URL(window.location.href);
      url.searchParams.delete('cfg');
      window.location.href = url.toString();
    },

    get maskedClientId() {
      const id = localStorage.getItem('et_client_id') || '';
      if (!id) return '';
      return id.length > 24 ? id.slice(0, 12) + '…' + id.slice(-8) : id;
    },

    get maskedScriptUrl() {
      const url = localStorage.getItem('et_script_url') || '';
      if (!url) return '';
      return url.length > 40 ? url.slice(0, 30) + '…' + url.slice(-8) : url;
    },

    async verifyScript() {
      const url = this.setupForm.scriptUrl.trim();
      if (!url || !url.startsWith('https://')) {
        this.setupErrors = { scriptUrl: 'Please paste the deployment URL (starts with https://).' };
        return;
      }
      this.setupVerifying = true;
      this.setupErrors = {};
      try {
        AppScript.init(url);
        const ok = await AppScript.ping();
        if (ok) {
          this.saveSetup();
        } else {
          this.setupErrors = { scriptUrl: 'Script responded but returned unexpected data. Check the deployment.' };
        }
      } catch {
        this.setupErrors = { scriptUrl: 'Could not reach the script. Check it is deployed as "Anyone" access and try again.' };
      } finally {
        this.setupVerifying = false;
      }
    },

    // ==============================================
    //  AUTH (continued)
    // ==============================================

    handleAuthError() {
      sessionStorage.removeItem('et_token');
      this.showToast(t('toast.session_expired'), 'warning');
      this.isAuthenticated = false;
      this.user = null;
      this.expenses = [];
    },

    // ==============================================
    //  SHEET SETUP
    // ==============================================

    async _setupSheetAndLoad() {
      await this._ensureSheet();
      await Promise.allSettled([
        this.loadExpenses(),
        this.loadDebts(),
        this.loadIncome(),
      ]);
    },

    async _ensureSheet() {
      try {
        this.sheetId = await Sheets.findOrCreateSheet(this.sheetId);
        localStorage.setItem('et_sheet_id', this.sheetId);
        this.sheetDisplayUrl = `https://docs.google.com/spreadsheets/d/${this.sheetId}`;
      } catch (err) {
        if (err.status === 401) { this.handleAuthError(); return; }
        console.error('Sheet setup error:', err);
      }
    },

    // ==============================================
    //  DATA ADAPTER (routes to AppScript or Sheets)
    // ==============================================

    async _dbRead() {
      if (this.appMode === 'appscript') return AppScript.readAllExpenses();
      return Sheets.readAllExpenses(this.sheetId);
    },
    async _dbAppend(expense) {
      if (this.appMode === 'appscript') return AppScript.appendExpense(expense);
      return Sheets.appendExpense(this.sheetId, expense);
    },
    async _dbUpdate(expense) {
      if (this.appMode === 'appscript') return AppScript.updateExpense(expense);
      return Sheets.updateExpense(this.sheetId, expense);
    },
    async _dbDelete(id) {
      if (this.appMode === 'appscript') return AppScript.deleteExpense(id);
      return Sheets.deleteExpense(this.sheetId, id);
    },

    // ---- Debt adapters ----
    async _dbReadDebts() {
      if (this.appMode === 'appscript') return AppScript.readAllDebts();
      return Sheets.readAllDebts(this.sheetId);
    },
    async _dbAppendDebt(debt) {
      if (this.appMode === 'appscript') return AppScript.appendDebt(debt);
      return Sheets.appendDebt(this.sheetId, debt);
    },
    async _dbUpdateDebt(debt) {
      if (this.appMode === 'appscript') return AppScript.updateDebt(debt);
      return Sheets.updateDebt(this.sheetId, debt);
    },
    async _dbDeleteDebt(id) {
      if (this.appMode === 'appscript') return AppScript.deleteDebt(id);
      return Sheets.deleteDebt(this.sheetId, id);
    },
    async _dbReadDebtPayments(debtId) {
      if (this.appMode === 'appscript') return AppScript.readDebtPayments(debtId);
      return Sheets.readDebtPayments(this.sheetId, debtId);
    },
    async _dbAppendDebtPayment(payment) {
      if (this.appMode === 'appscript') return AppScript.appendDebtPayment(payment);
      return Sheets.appendDebtPayment(this.sheetId, payment);
    },
    async _dbDeleteDebtPayment(id) {
      if (this.appMode === 'appscript') return AppScript.deleteDebtPayment(id);
      return Sheets.deleteDebtPayment(this.sheetId, id);
    },

    // ---- Income adapters ----
    async _dbReadIncome() {
      if (this.appMode === 'appscript') return AppScript.readAllIncome();
      return Sheets.readAllIncome(this.sheetId);
    },
    async _dbAppendIncome(entry) {
      if (this.appMode === 'appscript') return AppScript.appendIncomeEntry(entry);
      return Sheets.appendIncomeEntry(this.sheetId, entry);
    },
    async _dbDeleteIncome(id) {
      if (this.appMode === 'appscript') return AppScript.deleteIncomeEntry(id);
      return Sheets.deleteIncomeEntry(this.sheetId, id);
    },

    // ==============================================
    //  DATA
    // ==============================================

    async loadExpenses() {
      if (this.appMode !== 'appscript') {
        if (!this.sheetId) await this._ensureSheet();
        if (!this.sheetId) return;
      }
      this.isLoading = true;
      try {
        this.expenses = await this._dbRead();
      } catch (err) {
        if (err.status === 401) { this.handleAuthError(); return; }
        if (err.status === 404 && this.appMode !== 'appscript') {
          localStorage.removeItem('et_sheet_id');
          this.sheetId = null;
          await this._ensureSheet();
          this.expenses = [];
        } else {
          this.showToast(t('toast.load_failed'), 'error');
        }
      } finally {
        this.isLoading = false;
      }
    },

    async refreshExpenses() {
      await this.loadExpenses();
      this.showToast(t('toast.refreshed'), 'success');
    },

    // ==============================================
    //  INCOME
    // ==============================================

    async loadIncome() {
      if (this.appMode !== 'appscript' && !this.sheetId) return;
      if (!this._incomeTabEnsured && this.appMode !== 'appscript') {
        try { await Sheets.ensureIncomeTab(this.sheetId); } catch {}
        this._incomeTabEnsured = true;
      }
      try {
        this.income = await this._dbReadIncome();
      } catch (err) {
        if (err && err.status === 401) { this.handleAuthError(); return; }
        // Non-fatal: income tab may not exist yet on first load
        console.warn('[loadIncome] failed:', err);
      }
    },

    openAddIncome() {
      this.incomeForm = {
        id: null,
        source: '',
        amount: '',
        currency: this.defaultCurrency,
        date: new Date().toISOString().split('T')[0],
        notes: '',
        isLoan: false,
        loanId: null,
      };
      this.incomeFormErrors = {};
      this.showIncomeForm = true;
    },

    closeIncomeForm() {
      this.showIncomeForm = false;
    },

    async saveIncome() {
      const errors = {};
      const source = (this.incomeForm.source || '').trim();
      if (!source) errors.source = t('error.income_source');
      const amount = parseFloat(this.incomeForm.amount);
      if (!this.incomeForm.amount || isNaN(amount) || amount <= 0) errors.amount = t('error.income_amount');
      this.incomeFormErrors = errors;
      if (Object.keys(errors).length > 0) return;

      this.isSavingIncome = true;
      try {
        const isLoan = !!this.incomeForm.isLoan;
        const loanId = isLoan ? crypto.randomUUID() : '';
        const currency = (this.incomeForm.currency || this.defaultCurrency || '').toUpperCase();
        const incomeDate = this.incomeForm.date;
        const entry = {
          id: crypto.randomUUID(),
          type: 'income',
          source,
          amount: amount.toFixed(2),
          currency,
          date: incomeDate,
          notes: (this.incomeForm.notes || '').trim(),
          createdAt: new Date().toISOString(),
          loanId,
        };
        await this._dbAppendIncome(entry);
        this.income.push(entry);
        this.showIncomeForm = false;

        if (isLoan) {
          // Create paired debt entry
          try {
            const debt = {
              id: crypto.randomUUID(),
              source,
              totalAmount: amount.toFixed(2),
              date: incomeDate,
              outstandingBalance: amount.toFixed(2),
              currency,
              dueDate: '',
              notes: '',
              status: 'open',
              createdAt: new Date().toISOString(),
              loanId,
            };
            await this._dbAppendDebt(debt);
            this.debts.unshift(debt);
            this.showToast(t('loan.income_debt_saved'), 'success');
          } catch (debtErr) {
            console.error('[loan] debt counterpart failed:', debtErr);
            if (debtErr && debtErr.status === 401) { this.handleAuthError(); return; }
            this.showToast(t('loan.income_saved_debt_failed'), 'warning');
          }
        } else {
          this.showToast(t('toast.income_added'), 'success');
        }
      } catch (err) {
        console.error('[income] saveIncome error:', err);
        if (err && err.status === 401) { this.handleAuthError(); return; }
        const msg = (err && err.message === 'Unknown action')
          ? t('toast.script_needs_update') : t('toast.save_failed');
        this.showToast(msg, 'error');
      } finally {
        this.isSavingIncome = false;
      }
    },

    openReconcile() {
      const tracked = this.totalNetBalance;
      this.reconcileTrackedBalance = tracked;
      this.reconcileForm = {
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      };
      this.reconcileFormErrors = {};
      this.showReconcileForm = true;
    },

    closeReconcileForm() {
      this.showReconcileForm = false;
    },

    async saveReconciliation() {
      const errors = {};
      const amount = parseFloat(this.reconcileForm.amount);
      if (!this.reconcileForm.amount || isNaN(amount) || amount === 0) {
        errors.amount = t('error.reconcile_amount');
      }
      this.reconcileFormErrors = errors;
      if (Object.keys(errors).length > 0) return;

      this.isSavingReconcile = true;
      try {
        const entry = {
          id: crypto.randomUUID(),
          type: 'reconciliation',
          source: t('income.balance_adjustment'),
          amount: amount.toFixed(2),
          currency: (this.defaultCurrency || '').toUpperCase(),
          date: this.reconcileForm.date,
          notes: (this.reconcileForm.notes || '').trim(),
          createdAt: new Date().toISOString(),
        };
        await this._dbAppendIncome(entry);
        this.income.push(entry);
        this.showReconcileForm = false;
        this.showToast(t('toast.reconciliation_saved'), 'success');
      } catch (err) {
        console.error('[income] saveReconciliation error:', err);
        if (err && err.status === 401) { this.handleAuthError(); return; }
        const msg = (err && err.message === 'Unknown action')
          ? t('toast.script_needs_update') : t('toast.save_failed');
        this.showToast(msg, 'error');
      } finally {
        this.isSavingReconcile = false;
      }
    },

    async confirmDeleteIncome(entry) {
      if (!confirm(t('income.delete_confirm'))) return;
      try {
        await this._dbDeleteIncome(entry.id);
        this.income = this.income.filter(e => e.id !== entry.id);
        this.showToast(t('toast.income_deleted'), 'success');
      } catch (err) {
        if (err && err.status === 401) { this.handleAuthError(); return; }
        this.showToast(t('toast.delete_failed'), 'error');
      }
    },

    get incomeByMonth() {
      // Group income (and reconciliation) entries by YYYY-MM, newest month first
      const groups = {};
      for (const e of this.income) {
        if (!e.date) continue;
        const key = e.date.slice(0, 7); // YYYY-MM
        if (!groups[key]) groups[key] = [];
        groups[key].push(e);
      }
      return Object.keys(groups)
        .sort((a, b) => b.localeCompare(a))
        .map(key => ({
          key,
          label: (() => {
            const [y, m] = key.split('-').map(Number);
            return new Date(y, m - 1, 1).toLocaleString(window._activeLocale || 'en-GB', { month: 'long', year: 'numeric' });
          })(),
          entries: groups[key].sort((a, b) => b.date.localeCompare(a.date)),
        }));
    },

    get carryOverByMonth() {
      // Build sorted list of all months that have income or expense data
      const monthSet = new Set();
      for (const e of this.income) { if (e.date) monthSet.add(e.date.slice(0, 7)); }
      for (const e of this.expenses) { if (e.date) monthSet.add(e.date.slice(0, 7)); }

      const sortedMonths = [...monthSet].sort(); // oldest first
      const result = {}; // YYYY-MM → { carryIn, income, reconciliation, expenses, closing }

      let runningBalance = 0;
      for (const month of sortedMonths) {
        const carryIn = runningBalance;
        let monthIncome = 0;
        let monthReconciliation = 0;
        let monthExpenses = 0;

        for (const e of this.income) {
          if (!e.date || e.date.slice(0, 7) !== month) continue;
          const amt = parseFloat(e.amount || 0);
          if (e.type === 'reconciliation') monthReconciliation += amt;
          else monthIncome += amt;
        }
        for (const e of this.expenses) {
          if (!e.date || e.date.slice(0, 7) !== month) continue;
          monthExpenses += parseFloat(e.amount || 0);
        }

        const closing = carryIn + monthIncome + monthReconciliation - monthExpenses;
        result[month] = { carryIn, income: monthIncome, reconciliation: monthReconciliation, expenses: monthExpenses, closing };
        runningBalance = closing;
      }
      return result;
    },

    get totalNetBalance() {
      let total = 0;
      for (const e of this.income) {
        total += parseFloat(e.amount || 0);
      }
      for (const e of this.expenses) {
        total -= parseFloat(e.amount || 0);
      }
      return total;
    },

    get currentMonthIncome() {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return this.income
        .filter(e => e.type !== 'reconciliation' && e.date && e.date.startsWith(month))
        .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    },

    get currentMonthReconciliation() {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return this.income
        .filter(e => e.type === 'reconciliation' && e.date && e.date.startsWith(month))
        .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    },

    // ==============================================
    //  DEBTS
    // ==============================================

    async loadDebts() {
      if (this.appMode !== 'appscript' && !this.sheetId) return;
      if (!this._debtTabsEnsured && this.appMode !== 'appscript') {
        try { await Sheets.ensureDebtsTabs(this.sheetId); } catch {}
        this._debtTabsEnsured = true;
      }
      try {
        this.debts = await this._dbReadDebts();
      } catch (err) {
        if (err && err.status === 401) { this.handleAuthError(); return; }
        // Non-fatal: debts tab may not exist yet on first load
        console.warn('[loadDebts] failed:', err);
      }
    },

    get groupedDebts() {
      const groups = {};
      for (const d of this.debts) {
        const key = (d.source || '').trim().toLowerCase();
        if (!key) continue;
        if (!groups[key]) {
          groups[key] = {
            sourceKey: key,
            displaySource: d.source,
            currency: d.currency,
            totalOutstanding: 0,
            totalOriginal: 0,
            debts: [],
          };
        }
        const outstanding = parseFloat(d.outstandingBalance) || 0;
        const original = parseFloat(d.totalAmount) || 0;
        groups[key].totalOutstanding += outstanding;
        groups[key].totalOriginal += original;
        groups[key].debts.push(d);
      }
      return Object.values(groups)
        .sort((a, b) => b.totalOutstanding - a.totalOutstanding);
    },

    get debtSummary() {
      const byCurrency = {};
      for (const d of this.debts) {
        if (d.status === 'paid') continue;
        const cur = (d.currency || '').toUpperCase();
        const amt = parseFloat(d.outstandingBalance || 0);
        if (!cur || amt <= 0) continue;
        byCurrency[cur] = (byCurrency[cur] || 0) + amt;
      }
      return Object.entries(byCurrency).map(([currency, total]) => ({ currency, total }));
    },

    get activeCreditorCount() {
      return this.groupedDebts.filter(g => g.totalOutstanding > 0).length;
    },

    openAddDebt() {
      this.isEditingDebt = false;
      this.debtForm = {
        id: null,
        source: '',
        date: new Date().toISOString().slice(0, 10),
        totalAmount: '',
        outstandingBalance: '',
        currency: this.defaultCurrency,
        notes: '',
        isLoan: false,
        loanId: null,
      };
      this.debtFormErrors = {};
      this.showDebtForm = true;
    },

    openEditDebt(debt) {
      this.isEditingDebt = true;
      this.debtForm = {
        id: debt.id,
        source: debt.source,
        date: debt.date || new Date().toISOString().slice(0, 10),
        totalAmount: debt.totalAmount,
        outstandingBalance: debt.outstandingBalance,
        currency: debt.currency,
        notes: debt.notes || '',
        isLoan: false,
        loanId: null,
      };
      this.debtFormErrors = {};
      this.showDebtForm = true;
    },

    closeDebtForm() {
      this.showDebtForm = false;
    },

    async saveDebt() {
      const errors = {};
      const source = (this.debtForm.source || '').trim();
      if (!source) errors.source = t('error.debt_source');
      const amount = parseFloat(this.debtForm.totalAmount);
      if (!this.debtForm.totalAmount || isNaN(amount) || amount <= 0) errors.amount = t('error.debt_amount');
      if (!this.debtForm.currency) errors.currency = t('error.debt_source');
      this.debtFormErrors = errors;
      if (Object.keys(errors).length > 0) return;

      this.isSavingDebt = true;
      try {
        if (this.isEditingDebt) {
          const existing = this.debts.find(d => d.id === this.debtForm.id);
          const debt = {
            ...this.debtForm,
            source,
            date: this.debtForm.date || existing?.date || '',
            totalAmount: amount.toFixed(2),
            outstandingBalance: parseFloat(this.debtForm.outstandingBalance || this.debtForm.totalAmount).toFixed(2),
            currency: this.debtForm.currency.toUpperCase(),
            dueDate: existing ? (existing.dueDate || '') : '',
          };
          await this._dbUpdateDebt(debt);
          const idx = this.debts.findIndex(d => d.id === debt.id);
          if (idx >= 0) this.debts.splice(idx, 1, debt);
          this.showToast(t('toast.debt_updated'), 'success');
        } else {
          const isLoan = !!this.debtForm.isLoan;
          const loanId = isLoan ? crypto.randomUUID() : '';
          const debtDate = this.debtForm.date || new Date().toISOString().slice(0, 10);
          const currency = this.debtForm.currency.toUpperCase();
          const debt = {
            id: crypto.randomUUID(),
            source,
            totalAmount: amount.toFixed(2),
            date: debtDate,
            outstandingBalance: amount.toFixed(2),
            currency,
            dueDate: '',
            notes: this.debtForm.notes.trim(),
            status: 'open',
            createdAt: new Date().toISOString(),
            loanId,
          };
          await this._dbAppendDebt(debt);
          this.debts.unshift(debt);

          if (isLoan) {
            // Create paired income entry
            try {
              const incomeEntry = {
                id: crypto.randomUUID(),
                type: 'income',
                source,
                amount: amount.toFixed(2),
                currency,
                date: debtDate,
                notes: '',
                createdAt: new Date().toISOString(),
                loanId,
              };
              await this._dbAppendIncome(incomeEntry);
              this.income.push(incomeEntry);
              this.showToast(t('loan.both_saved'), 'success');
            } catch (incomeErr) {
              console.error('[loan] income counterpart failed:', incomeErr);
              if (incomeErr && incomeErr.status === 401) { this.handleAuthError(); return; }
              this.showToast(t('loan.debt_saved_income_failed'), 'warning');
            }
          } else {
            this.showToast(t('toast.debt_saved'), 'success');
          }
        }
        this.showDebtForm = false;
      } catch (err) {
        if (err && err.status === 401) { this.handleAuthError(); return; }
        this.showToast(t('toast.debt_save_failed'), 'error');
      } finally {
        this.isSavingDebt = false;
      }
    },

    async confirmDeleteDebt(debtId) {
      if (!confirm(t('debts.delete_confirm'))) return;
      try {
        await this._dbDeleteDebt(debtId);
        this.debts = this.debts.filter(d => d.id !== debtId);
        this.showToast(t('toast.debt_deleted'), 'success');
      } catch (err) {
        if (err && err.status === 401) { this.handleAuthError(); return; }
        this.showToast(t('toast.debt_save_failed'), 'error');
      }
    },

    openPaymentForm(debt, prefillFull = false) {
      const outstanding = parseFloat(debt.outstandingBalance || 0);
      this.paymentForm = {
        debtId: debt.id,
        debtSource: debt.source,
        outstandingBalance: outstanding,
        debtCurrency: debt.currency,
        amount: prefillFull ? outstanding.toString() : '',
        currency: debt.currency,
        date: new Date().toISOString().split('T')[0],
        notes: '',
      };
      this.paymentFormErrors = {};
      this.showPaymentForm = true;
    },

    closePaymentForm() {
      this.showPaymentForm = false;
    },

    async savePayment() {
      const errors = {};
      const amount = parseFloat(this.paymentForm.amount);
      if (!this.paymentForm.amount || isNaN(amount) || amount <= 0) {
        errors.amount = t('error.payment_amount');
      } else if (amount > this.paymentForm.outstandingBalance + 0.001) {
        errors.amount = t('error.payment_overpay');
      }
      if (!this.paymentForm.date) errors.date = t('error.debt_source');
      this.paymentFormErrors = errors;
      if (Object.keys(errors).length > 0) return;

      this.isSavingPayment = true;
      try {
        const payment = {
          id: crypto.randomUUID(),
          debtId: this.paymentForm.debtId,
          amount: amount.toFixed(2),
          currency: (this.paymentForm.currency || this.paymentForm.debtCurrency).toUpperCase(),
          date: this.paymentForm.date,
          notes: (this.paymentForm.notes || '').trim(),
          createdAt: new Date().toISOString(),
        };

        // 1. Write expense first (idempotent by ID)
        const expense = {
          id: crypto.randomUUID(),
          date: payment.date,
          amount: payment.amount,
          currency: payment.currency,
          category: 'Debt Payment',
          merchant: this.paymentForm.debtSource,
          notes: `Payment toward ${this.paymentForm.debtSource}${payment.notes ? ': ' + payment.notes : ''}`,
          receiptUrl: '',
          createdAt: new Date().toISOString(),
        };
        await this._dbAppend(expense);
        this.expenses.unshift(expense);

        // 2. Write payment record
        await this._dbAppendDebtPayment(payment);
        if (!this.debtPayments[payment.debtId]) this.debtPayments[payment.debtId] = [];
        this.debtPayments[payment.debtId].unshift(payment);

        // 3. Update debt outstanding balance
        const debt = this.debts.find(d => d.id === payment.debtId);
        if (debt) {
          const newBalance = Math.max(0, parseFloat(debt.outstandingBalance) - amount);
          const updatedDebt = {
            ...debt,
            outstandingBalance: newBalance.toFixed(2),
            status: newBalance <= 0 ? 'paid' : 'open',
          };
          await this._dbUpdateDebt(updatedDebt);
          const idx = this.debts.findIndex(d => d.id === debt.id);
          if (idx >= 0) this.debts.splice(idx, 1, updatedDebt);
        }

        this.showPaymentForm = false;
        this.showToast(t('toast.payment_saved'), 'success');
      } catch (err) {
        if (err && err.status === 401) { this.handleAuthError(); return; }
        this.showToast(t('toast.payment_save_failed'), 'error');
      } finally {
        this.isSavingPayment = false;
      }
    },

    async loadDebtPayments(debtId) {
      try {
        const payments = await this._dbReadDebtPayments(debtId);
        this.debtPayments = { ...this.debtPayments, [debtId]: payments };
      } catch {}
    },

    toggleDebtExpanded(sourceKey) {
      this._debtExpanded = { ...this._debtExpanded, [sourceKey]: !this._debtExpanded[sourceKey] };
    },

    async toggleDebtHistory(debt) {
      const open = !this._debtHistoryOpen[debt.id];
      this._debtHistoryOpen = { ...this._debtHistoryOpen, [debt.id]: open };
      if (open && !this.debtPayments[debt.id]) {
        await this.loadDebtPayments(debt.id);
      }
    },

    debtProgress(group) {
      const total = parseFloat(group.totalOriginal) || 0;
      const outstanding = parseFloat(group.totalOutstanding) || 0;
      if (total <= 0) return 100;
      const paid = total - outstanding;
      const pct = Math.round((paid / total) * 100);
      return isNaN(pct) ? 100 : Math.max(0, Math.min(100, pct));
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
          (e.category || '').toLowerCase().includes(q) ||
          t(e.category || '').toLowerCase().includes(q)
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
        if (!confirm(t('confirm.discard'))) return;
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
      if (this.formDirty && !confirm(t('confirm.discard'))) return;
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
        errors.amount = t('error.amount');
      }
      if (!this.form.category) {
        errors.category = t('error.category');
      }
      if (this.form.category === 'Other' && !this.form.customCategory.trim()) {
        errors.customCategory = t('error.custom_category');
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
          this.showToast(t('toast.saved_receipt_failed'), 'warning');
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
          await this._dbUpdate(expense);
          const idx = this.expenses.findIndex((e) => e.id === expense.id);
          if (idx >= 0) this.expenses.splice(idx, 1, expense);
          this.showToast(t('toast.updated'), 'success');
        } else {
          await this._dbAppend(expense);
          this.expenses.unshift(expense);
          this.showToast(t('toast.saved'), 'success');
        }
        this.formDirty = false;
        this.goBack();
      } catch (err) {
        if (err.status === 401) { this.handleAuthError(); return; }
        this.showToast(t('toast.save_failed'), 'error');
        console.error('Save error:', err);
      } finally {
        this.isSaving = false;
      }
    },

    cancelForm() {
      if (this.formDirty && !confirm(t('confirm.discard'))) return;
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
        await this._dbUpdate(updated);
        const idx = this.expenses.findIndex((e) => e.id === expense.id);
        if (idx >= 0) this.expenses.splice(idx, 1, updated);
        this.selectedExpense = updated;
        this.showToast(t('toast.receipt_added'), 'success');
      } catch (err) {
        if (err.status === 401) { this.handleAuthError(); return; }
        this.showToast(t('toast.receipt_failed'), 'error');
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
        await this._dbDelete(this.selectedExpense.id);
        this.expenses = this.expenses.filter((e) => e.id !== this.selectedExpense.id);
        this.closeDetail();
        this.showToast(t('toast.deleted'), 'success');
      } catch (err) {
        if (err.status === 401) { this.handleAuthError(); return; }
        this.showToast(t('toast.delete_failed'), 'error');
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
      const monthDebtPayments = [];
      const monthNewDebt = [];
      const monthIncome = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        let monthTotal = 0;
        let debtPaymentTotal = 0;
        for (const e of this.expenses) {
          if (!e.date || !e.date.startsWith(monthStr)) continue;
          if (isMultiCurrency) {
            const cur = (e.currency || this.defaultCurrency || '').toUpperCase();
            if (cur !== primaryCurrency) continue;
          }
          const amt = parseFloat(e.amount || 0);
          if (e.category === 'Debt Payment') debtPaymentTotal += amt;
          else monthTotal += amt;
        }
        // Net new debt: debts incurred in this month (use debt.date; fall back to createdAt for older records)
        let newDebtTotal = 0;
        for (const debt of this.debts) {
          const debtDate = debt.date || debt.createdAt || '';
          if (!debtDate.startsWith(monthStr)) continue;
          if (isMultiCurrency) {
            const cur = (debt.currency || '').toUpperCase();
            if (cur !== primaryCurrency) continue;
          }
          newDebtTotal += parseFloat(debt.totalAmount || 0);
        }
        // Income (excluding reconciliation entries) for this month
        let incomeTotal = 0;
        for (const e of this.income) {
          if (e.type === 'reconciliation') continue;
          if (!e.date || !e.date.startsWith(monthStr)) continue;
          incomeTotal += parseFloat(e.amount || 0);
        }
        const label = d.toLocaleString(window._activeLocale || 'en-GB', { month: 'short' });
        monthTrend.push({ label, total: monthTotal });
        monthDebtPayments.push({ label, total: debtPaymentTotal });
        monthNewDebt.push({ label, total: newDebtTotal });
        monthIncome.push({ label, total: incomeTotal });
      }

      const recent = [...this.expenses]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5);

      return { currencyTotals, primaryCurrency, isMultiCurrency, byCategory, monthTrend, monthDebtPayments, monthNewDebt, monthIncome, recent };
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
        const chartLabels = isEmpty ? [t('dashboard.chart_no_data')] : categories.map((c) => t(c));

        window._categoryChart = new Chart(catEl, {
          type: 'doughnut',
          data: {
            labels:   chartLabels,
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
        const hasDebtPayments = data.monthDebtPayments.some((m) => m.total > 0);
        const hasNewDebt      = data.monthNewDebt.some((m) => m.total > 0);
        const hasIncome       = data.monthIncome.some((m) => m.total > 0);
        const showLegend      = hasIncome || hasDebtPayments || hasNewDebt;
        const tickFont        = { family: 'Inter, system-ui, sans-serif', size: 11 };
        // Spending (purple) and debt payments (amber) share the upward stack.
        // Chart layout:
        //   "expenses" stack (above axis): Spending (purple) + Debt payments (amber)
        //   "income" stack  (above axis):  Income (green) — a separate parallel bar
        //   "debt"   stack  (below axis):  New debt (red)
        const datasets = [
          {
            label:           t('dashboard.spending'),
            data:            data.monthTrend.map((m) => m.total),
            backgroundColor: '#5B4FE9',
            stack:           'expenses',
            borderRadius:    hasDebtPayments ? 0 : 4,
            borderSkipped:   'bottom',
          },
        ];
        if (hasDebtPayments) {
          datasets.push({
            label:           t('dashboard.debt_payments'),
            data:            data.monthDebtPayments.map((m) => m.total),
            backgroundColor: '#D97706',
            stack:           'expenses',
            borderRadius:    4,
            borderSkipped:   'bottom',
          });
        }
        if (hasIncome) {
          datasets.push({
            label:           t('dashboard.income_this_month'),
            data:            data.monthIncome.map((m) => m.total),
            backgroundColor: '#059669',
            stack:           'income',
            borderRadius:    4,
            borderSkipped:   'bottom',
          });
        }
        if (hasNewDebt) {
          datasets.push({
            label:           t('dashboard.net_debt'),
            data:            data.monthNewDebt.map((m) => -m.total),
            backgroundColor: '#EF4444',
            stack:           'debt',
            borderRadius:    4,
            borderSkipped:   'top',
          });
        }
        window._trendChart = new Chart(trendEl, {
          type: 'bar',
          data: {
            labels: data.monthTrend.map((m) => m.label),
            datasets,
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: showLegend,
                position: 'top',
                align: 'end',
                labels: { boxWidth: 10, boxHeight: 10, borderRadius: 3, useBorderRadius: true, padding: 12, font: tickFont, color: '#9CA3AF' },
              },
              tooltip: {
                callbacks: {
                  label: (ctx) => {
                    const val = Math.abs(ctx.raw);
                    return val > 0 ? ` ${ctx.dataset.label}: ${this.formatCurrency(val, data.primaryCurrency)}` : null;
                  },
                },
                filter: (item) => Math.abs(item.raw) > 0,
              },
            },
            scales: {
              x: {
                stacked: true,
                grid:    { display: false },
                ticks:   { font: tickFont, color: '#9CA3AF' },
              },
              y: {
                stacked: true,
                grid:    { color: '#F1F4F9', drawBorder: false },
                ticks:   {
                  font:     tickFont,
                  color:    '#9CA3AF',
                  callback: (v) => this.formatCurrencyCompact(Math.abs(v), data.primaryCurrency),
                },
              },
            },
          },
        });
      }
    },

    get dashboardSummary() {
      return { ...this.computeDashboardData(), debtSummary: this.debtSummary };
    },

    // ==============================================
    //  SETTINGS
    // ==============================================

    saveSettings() {
      localStorage.setItem('et_settings', JSON.stringify({
        defaultCurrency: this.defaultCurrency,
        receiptUpload: this.receiptUploadEnabled,
        appMode: this.appMode,
      }));
      // Keep ?cfg= URL in sync so bookmarked URL stays accurate.
      const clientId  = localStorage.getItem('et_client_id')  || '';
      const sheetId   = localStorage.getItem('et_sheet_id')   || '';
      const scriptUrl = localStorage.getItem('et_script_url') || '';
      const newUrl    = this._buildConfigUrl(clientId || null, sheetId || null, this.defaultCurrency || null, this.receiptUploadEnabled, scriptUrl || null);
      window.history.replaceState(null, '', newUrl);
      this.showToast(t('toast.settings_saved'), 'success');
    },

    // --------------------------------------------------
    //  BRANDING (settings)
    // --------------------------------------------------

    // Convert a selected image file to a base64 data-URI and save it as the icon.
    handleBrandingIconUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.appIcon = e.target.result;
        this.saveBranding();
      };
      reader.readAsDataURL(file);
      event.target.value = '';
    },

    // Persist current appTitle/appIcon into the URL (same pattern as saveSettings).
    saveBranding() {
      this._applyBranding();
      const clientId  = localStorage.getItem('et_client_id')  || '';
      const sheetId   = localStorage.getItem('et_sheet_id')   || '';
      const scriptUrl = localStorage.getItem('et_script_url') || '';
      const newUrl = this._buildConfigUrl(
        clientId  || null,
        sheetId   || null,
        this.defaultCurrency || null,
        this.receiptUploadEnabled,
        scriptUrl || null,
      );
      window.history.replaceState(null, '', newUrl);
      this.showToast('Branding saved', 'success');
    },

    resetBranding() {
      this.appTitle = '';
      this.appIcon  = '';
      this._brandingIconUrl = '';
      document.title = 'Expense Tracker';
      const metaTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
      if (metaTitle) metaTitle.setAttribute('content', 'Expenses');
      document.querySelectorAll('link[data-branding]').forEach(el => el.remove());
      const clientId  = localStorage.getItem('et_client_id')  || '';
      const sheetId   = localStorage.getItem('et_sheet_id')   || '';
      const scriptUrl = localStorage.getItem('et_script_url') || '';
      const newUrl = this._buildConfigUrl(
        clientId  || null,
        sheetId   || null,
        this.defaultCurrency || null,
        this.receiptUploadEnabled,
        scriptUrl || null,
      );
      window.history.replaceState(null, '', newUrl);
      this.showToast('Branding reset to defaults', 'success');
    },

    pickEmoji(emoji) {
      this.appIcon = emoji;
      this.showEmojiPicker = false;
      this.saveBranding();
    },

    get brandingIconIsFile() {
      return this.appIcon.length > 10;
    },

    get brandingIconSizeWarning() {
      return this.appIcon.length > 10240;
    },


    openSheet() {
      const url = this.sheetDisplayUrl ||
        (this.sheetId ? `https://docs.google.com/spreadsheets/d/${this.sheetId}` : null);
      if (url) window.open(url, '_blank');
    },

    saveSheetUrl() {
      const url = this.sheetUrlInput.trim();
      if (!url) return;
      this.sheetDisplayUrl = url;
      this.sheetUrlFetchFailed = false;
      localStorage.setItem('et_sheet_display_url', url);
      this.sheetUrlInput = '';
      this.showToast(t('toast.sheet_url_saved'), 'success');
    },

    getScriptSource() {
      return AppScript.SCRIPT_SOURCE;
    },

    async copyScriptSource() {
      try {
        await navigator.clipboard.writeText(AppScript.SCRIPT_SOURCE);
        this.showToast(t('toast.script_copied'), 'success');
      } catch {
        this.showToast(t('toast.copy_failed'), 'error');
      }
    },

    async relinkSheet() {
      if (!confirm(t('confirm.relink'))) return;
      localStorage.removeItem('et_sheet_id');
      this.sheetId = null;
      await this._ensureSheet();
      await this.loadExpenses();
      this.showToast(t('toast.sheet_relinked'), 'success');
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
      const locale = window._activeLocale || 'en-GB';
      if (!cur) {
        // No currency info — render as a plain decimal number
        return new Intl.NumberFormat(locale, {
          minimumFractionDigits: 2, maximumFractionDigits: 2,
        }).format(num);
      }
      try {
        return new Intl.NumberFormat(locale, {
          style: 'currency', currency: cur,
          minimumFractionDigits: 2, maximumFractionDigits: 2,
        }).format(num);
      } catch {
        // Unknown currency code — prefix manually
        return `${cur} ${new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)}`;
      }
    },

    formatCurrencyCompact(amount, currency) {
      const num = parseFloat(amount) || 0;
      const cur = (currency || this.defaultCurrency || '').toUpperCase();
      const locale = window._activeLocale || 'en-GB';
      if (!cur) {
        if (num === 0) return '0';
        return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : String(Math.round(num));
      }
      try {
        return new Intl.NumberFormat(locale, {
          style: 'currency', currency: cur,
          notation: 'compact', maximumFractionDigits: 1,
        }).format(num);
      } catch {
        return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : String(Math.round(num));
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return '';
      const locale = window._activeLocale || 'en-GB';
      try {
        return new Date(dateStr + 'T00:00:00').toLocaleDateString(locale, {
          month: 'short', day: 'numeric', year: 'numeric',
        });
      } catch { return dateStr; }
    },

    formatDateShort(dateStr) {
      if (!dateStr) return '';
      const locale = window._activeLocale || 'en-GB';
      try {
        return new Date(dateStr + 'T00:00:00').toLocaleDateString(locale, {
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

    get scriptVersionRequired() {
      return CONFIG.SCRIPT_VERSION;
    },

  };
}
