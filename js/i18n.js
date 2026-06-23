// ============================================================
// i18n.js — Internationalisation module
//
// Locale is determined from the URL query parameter — no localStorage,
// no cookies, no server-side routing required.
//
// URL convention:
//   ?lang=es  →  es-AR (Argentine Spanish)
//   (absent)  →  en-GB (English, default)
//
// Exposed globals (available before Alpine initialises):
//   t(key)                    — translate a string key
//   switchLocale(locale)      — rewrite URL to change locale and reload
//   window._activeLocale      — the detected locale string
// ============================================================

const I18n = (() => {

  // ----------------------------------------------------------
  // Translation dictionaries
  // ----------------------------------------------------------
  const LOCALES = {
    'en-GB': {
      // App
      'app.loading': 'Loading…',
      'app.title':   'Expense Tracker',

      // Navigation
      'nav.dashboard':   'Dashboard',
      'nav.expenses':    'Expenses',
      'nav.settings':    'Settings',
      'nav.add_expense': 'Add Expense',

      // Setup screen
      'setup.title':         'One-time Setup',
      'setup.how_to_store':  'How do you want to store your expenses?',
      'setup.fresh.title':   'Create a new sheet for me',
      'setup.existing.title':'Connect an existing sheet',
      'setup.appscript.title':'Use without signing in',
      'setup.back':          '← Change setup method',
      'setup.step_cloud':    'Step 1 of 3 — Google Cloud project',
      'setup.step_oauth':    'Step 2 of 3 — OAuth credentials',
      'setup.step_connect':  'Step 3 of 3 — Connect',
      'setup.next':          'Next →',
      'setup.back_btn':      '← Back',
      'setup.connect':       'Connect',
      'setup.save_continue': 'Save & Continue',
      'setup.verify_save':   'Verify & Save',
      'setup.verifying':     'Verifying…',

      // Sign-in screen
      'signin.title':           'Expense Tracker',
      'signin.subtitle':        'Your expenses. Your data. Stored in your own Google Sheet.',
      'signin.button':          'Sign in with Google',
      'signin.what_you_get':    'What you get',
      'signin.feature_history': 'Full expense history in a Google Sheet you own',
      'signin.feature_receipts':'Receipt photos stored in your Google Drive',
      'signin.feature_free':    'No subscription. No server. Free forever.',

      // Dashboard
      'dashboard.title':              'Dashboard',
      'dashboard.total_spent':        'Total Spent',
      'dashboard.spending_by_category':'Spending by Category',
      'dashboard.trend':              '6-Month Trend',
      'dashboard.spending':           'Spending',
      'dashboard.debt_payments':      'Debt payments',
      'dashboard.net_debt':           'New debt',
      'dashboard.analysis':           'Analysis',
      'dashboard.recent_expenses':    'Recent Expenses',
      'dashboard.no_expenses':        'No expenses yet',
      'dashboard.view_all':           'View all expenses',
      'dashboard.across_currencies':  'across {n} currencies',
      'dashboard.chart_no_data':      'No data',

      // Period tabs
      'period.this_month':    'This Month',
      'period.last_month':    'Last Month',
      'period.last_3_months': '3 Months',
      'period.this_year':     'This Year',
      'period.all_time':      'All Time',

      // Expenses list
      'expenses.title':              'Expenses',
      'expenses.search_placeholder': 'Search expenses…',
      'expenses.filter.category':    'Category',
      'expenses.filter.from':        'From',
      'expenses.filter.to':          'To',
      'expenses.filter.clear':       'Clear filters',
      'expenses.sort.date_desc':     'Newest first',
      'expenses.sort.date_asc':      'Oldest first',
      'expenses.sort.amount_desc':   'Highest amount',
      'expenses.sort.amount_asc':    'Lowest amount',
      'expenses.empty.title':        'No expenses yet',
      'expenses.empty.desc':         'Tap the + button to add your first expense.',
      'expenses.no_results.title':   'No results',
      'expenses.no_results.desc':    'No expenses match your search or filters.',
      'expenses.clear_search':       'Clear search & filters',
      'expenses.count.singular':     'expense',
      'expenses.count.plural':       'expenses',

      // Expense form
      'form.edit_title':              'Edit Expense',
      'form.add_title':               'Add Expense',
      'form.save':                    'Save',
      'form.saving':                  'Saving…',
      'form.update':                  'Update',
      'form.save_expense':            'Save Expense',
      'form.cancel':                  'Cancel',
      'form.amount':                  'Amount',
      'form.currency':                'Currency',
      'form.date':                    'Date',
      'form.category':                'Category',
      'form.category.placeholder':    'Select a category…',
      'form.custom_category':         'Custom Category',
      'form.custom_category.placeholder': 'e.g. Gym, Coffee, Hobbies',
      'form.merchant':                'Merchant / Store',
      'form.merchant.placeholder':    'e.g. Amazon, Starbucks',
      'form.notes':                   'Notes',
      'form.notes.placeholder':       'Any extra details…',
      'form.receipt':                 'Receipt',
      'form.take_photo':              'Take Photo',
      'form.upload_file':             'Upload File',
      'form.replace_file':            'Replace file',

      // Validation errors
      'error.amount':          'Please enter a valid positive amount.',
      'error.category':        'Please select a category.',
      'error.custom_category': 'Please enter a custom category name.',

      // Expense detail
      'detail.date':        'Date',
      'detail.merchant':    'Merchant',
      'detail.category':    'Category',
      'detail.notes':       'Notes',
      'detail.receipt':     'Receipt',
      'detail.view_receipt':'View Receipt',
      'detail.no_receipt':  'No receipt attached',
      'detail.add_receipt': '+ Add Receipt',
      'detail.delete':      'Delete',
      'detail.edit':        'Edit',

      // Delete confirmation
      'delete.title':    'Delete Expense?',
      'delete.body':     'This will permanently remove the expense from your Google Sheet. This action cannot be undone.',
      'delete.confirm':  'Delete',
      'delete.deleting': 'Deleting…',
      'delete.cancel':   'Cancel',

      // Settings
      'settings.title':               'Settings',
      'settings.preferences':         'Preferences',
      'settings.dark_mode':           'Dark mode',
      'settings.light_mode':          'Light mode',
      'settings.dark_mode.desc':      'Toggle dark / light appearance',
      'settings.currency':            'Default Currency',
      'settings.currency.desc':       'Pre-fills currency on new expenses (optional)',
      'settings.receipt_upload':      'Receipt Upload',
      'settings.receipt_upload.desc': 'Store photos & PDFs in Google Drive',
      'settings.data':                'Data',
      'settings.open_sheet':          'Open Google Sheet',
      'settings.sheet.ready':         'View your expense spreadsheet',
      'settings.sheet.needs_update':  'Script needs updating — see below',
      'settings.script_version':       'Script Version',
      'settings.script_outdated':      'Script outdated — update required',
      'settings.script_outdated.desc': 'Your deployed Apps Script is out of date. Some features require the latest version.',
      'settings.script_update_steps':  'How to update',
      'settings.open_appscript':       'Open Apps Script editor',
      'settings.sheet.detecting':     'Detecting…',
      'settings.sheet.not_created':   'Sheet not yet created — add an expense first',
      'settings.relink':              'Re-link Sheet',
      'settings.relink.desc':         'Find or recreate the ExpenseTracker sheet',
      'settings.account':             'Account',
      'settings.remove':              'Remove',
      'settings.sign_out':            'Sign Out',
      'settings.sign_out.desc':       'Clear session and return to sign-in',
      'settings.about':               'About',
      'settings.view_github':         'View on GitHub',
      'settings.language':            'Language',
      'settings.language.desc':       'Switch display language',

      // Toast messages
      'toast.welcome':             'Welcome, {name}!',
      'toast.sign_in_failed':      'Sign-in failed. Please try again.',
      'toast.refreshed':           'Expenses refreshed.',
      'toast.load_failed':         'Failed to load expenses.',
      'toast.saved_receipt_failed':'Expense saved, but receipt upload failed. Retry from the expense detail.',
      'toast.saved':               'Expense saved.',
      'toast.updated':             'Expense updated.',
      'toast.save_failed':         'Failed to save. Please try again.',
      'toast.script_needs_update': 'Script outdated — income requires the latest deployment.',
      'toast.receipt_added':       'Receipt added.',
      'toast.receipt_failed':      'Receipt upload failed.',
      'toast.deleted':             'Expense deleted.',
      'toast.delete_failed':       'Failed to delete. Please try again.',
      'toast.session_expired':     'Session expired — please sign in again.',
      'toast.settings_saved':      'Settings saved.',
      'toast.sheet_url_saved':     'Sheet URL saved.',
      'toast.script_copied':       'Script copied to clipboard.',
      'toast.copy_failed':         'Copy failed — please select and copy manually.',
      'toast.sheet_relinked':      'Sheet re-linked.',

      // Confirm dialogs
      'confirm.discard':         'Discard unsaved changes?',
      'confirm.reset_connection':'Reset connection settings? You will need to re-run setup.',
      'confirm.relink':          'This will create or re-link your Google Sheet. Continue?',

      // Debts
      'nav.debts':                      'Debts',
      'debts.title':                    'Debts',
      'debts.add_debt':                 'Add Debt',
      'debts.empty.title':              'No debts yet',
      'debts.empty.desc':               'Tap "Add Debt" to track something you owe.',
      'debts.show_paid':                'Show paid',
      'debts.paid_badge':               'Paid',
      'debts.source':                   'Creditor / Source',
      'debts.source.placeholder':       'e.g. Bank, Credit Card, Friend',
      'debts.date':                     'Date incurred',
      'debts.total_amount':             'Total Amount',
      'debts.outstanding':              'Outstanding',
      'debts.due_date':                 'Due Date',
      'debts.notes':                    'Notes',
      'debts.notes.placeholder':        'Any extra details…',
      'debts.add_title':                'Add Debt',
      'debts.edit_title':               'Edit Debt',
      'debts.save':                     'Save Debt',
      'debts.cancel':                   'Cancel',
      'debts.pay':                      'Pay',
      'debts.settle_full':              'Settle in full',
      'debts.payment_history':          'Payment History',
      'debts.no_payments':              'No payments recorded yet.',
      'debts.delete_confirm':           'Delete this debt? This cannot be undone.',
      'debts.payment_title':            'Record Payment',
      'debts.payment_amount':           'Payment Amount',
      'debts.payment_date':             'Payment Date',
      'debts.payment_save':             'Record Payment',
      'debts.payment_saving':           'Saving…',
      'debts.remaining_balance':        'Remaining balance',
      'dashboard.total_outstanding':    'Total Outstanding',
      'dashboard.creditor':             'creditor',
      'dashboard.creditors':            'creditors',
      'dashboard.view_debts':           'View debts',
      'dashboard.no_debts':             'No outstanding debts',
      'debts.n_debts':                  '· {n} debts',
      'error.debt_source':              'Please enter a creditor name.',
      'error.debt_amount':              'Please enter a valid positive amount.',
      'error.payment_amount':           'Please enter a valid amount.',
      'error.payment_overpay':          'Amount cannot exceed the outstanding balance.',
      'toast.debt_saved':               'Debt saved.',
      'toast.debt_updated':             'Debt updated.',
      'toast.debt_deleted':             'Debt deleted.',
      'toast.debt_save_failed':         'Failed to save debt. Please try again.',
      'toast.payment_saved':            'Payment recorded.',
      'toast.payment_save_failed':      'Failed to record payment. Please try again.',

      // Income
      'nav.income':                   'Income',
      'income.title':                 'Income',
      'income.add_income':            'Add Income',
      'income.source':                'Source',
      'income.source.placeholder':    'e.g. Salary, Freelance, Transfer',
      'income.notes':                 'Notes',
      'income.notes.placeholder':     'Any extra details…',
      'income.no_income_yet':         'No income recorded yet',
      'income.no_income_desc':        'Tap the + button to add your first income entry.',
      'income.carry_in':              'Carry-in',
      'income.closing_balance':       'Balance',
      'income.month_income':          'Income',
      'income.balance_adjustment':    'Balance adjustment',
      'income.delete_confirm':        'Delete this entry? This cannot be undone.',
      'income.negative_balance_hint': 'Balance is negative — reconciliation recommended.',
      'income.reconcile_btn':         'Reconcile',
      'income.add_title':             'Add Income',
      'income.save':                  'Save Income',

      // Reconciliation
      'reconcile.title':              'Reconcile Balance',
      'reconcile.tracked_balance':    'Current tracked balance',
      'reconcile.adjustment_amount':  'Adjustment amount',
      'reconcile.adjustment_hint':    'Positive if real cash exceeds tracked, negative if less.',
      'reconcile.save':               'Save Adjustment',

      // Dashboard income
      'dashboard.income_this_month':  'Income this month',
      'dashboard.expenses_this_month':'Expenses this month',
      'dashboard.net_this_month':     'Net this month',
      'dashboard.total_carry_over':   'Net balance',

      // Errors
      'error.income_source':          'Please enter an income source.',
      'error.income_amount':          'Please enter a valid positive amount.',
      'error.reconcile_amount':       'Adjustment must be non-zero.',

      // Toasts
      'toast.income_added':           'Income saved.',
      'toast.income_deleted':         'Entry deleted.',
      'toast.reconciliation_saved':   'Balance adjustment saved.',

      // Category display names (English keys = display values)
      'Food & Dining':       'Food & Dining',
      'Transportation':      'Transportation',
      'Shopping':            'Shopping',
      'Entertainment':       'Entertainment',
      'Health & Fitness':    'Health & Fitness',
      'Housing & Utilities': 'Housing & Utilities',
      'Travel':              'Travel',
      'Education':           'Education',
      'Personal Care':       'Personal Care',
      'Business':            'Business',
      'Debt Payment':        'Debt Payment',
      'Other':               'Other',
    },

    'es-AR': {
      // App
      'app.loading': 'Cargando…',
      'app.title':   'Registro de Gastos',

      // Navigation
      'nav.dashboard':   'Inicio',
      'nav.expenses':    'Gastos',
      'nav.settings':    'Ajustes',
      'nav.add_expense': 'Agregar gasto',

      // Setup screen
      'setup.title':         'Configuración inicial',
      'setup.how_to_store':  '¿Cómo querés guardar tus gastos?',
      'setup.fresh.title':   'Crear una planilla nueva',
      'setup.existing.title':'Conectar una planilla existente',
      'setup.appscript.title':'Usar sin iniciar sesión',
      'setup.back':          '← Cambiar método',
      'setup.step_cloud':    'Paso 1 de 3 — Proyecto en Google Cloud',
      'setup.step_oauth':    'Paso 2 de 3 — Credenciales OAuth',
      'setup.step_connect':  'Paso 3 de 3 — Conectar',
      'setup.next':          'Siguiente →',
      'setup.back_btn':      '← Atrás',
      'setup.connect':       'Conectar',
      'setup.save_continue': 'Guardar y continuar',
      'setup.verify_save':   'Verificar y guardar',
      'setup.verifying':     'Verificando…',

      // Sign-in screen
      'signin.title':           'Registro de Gastos',
      'signin.subtitle':        'Tus gastos. Tus datos. Guardados en tu propia Planilla de Google.',
      'signin.button':          'Iniciar sesión con Google',
      'signin.what_you_get':    'Qué obtenés',
      'signin.feature_history': 'Historial completo de gastos en una Planilla de Google tuya',
      'signin.feature_receipts':'Fotos de tickets guardadas en tu Google Drive',
      'signin.feature_free':    'Sin suscripción. Sin servidor. Gratis para siempre.',

      // Dashboard
      'dashboard.title':              'Inicio',
      'dashboard.total_spent':        'Total gastado',
      'dashboard.spending_by_category':'Gastos por categoría',
      'dashboard.trend':              'Tendencia (6 meses)',
      'dashboard.spending':           'Gastos',
      'dashboard.debt_payments':      'Pagos de deuda',
      'dashboard.net_debt':           'Deuda nueva',
      'dashboard.analysis':           'Análisis',
      'dashboard.recent_expenses':    'Gastos recientes',
      'dashboard.no_expenses':        'Sin gastos aún',
      'dashboard.view_all':           'Ver todos los gastos',
      'dashboard.across_currencies':  'en {n} monedas',
      'dashboard.chart_no_data':      'Sin datos',

      // Period tabs
      'period.this_month':    'Este mes',
      'period.last_month':    'Mes anterior',
      'period.last_3_months': '3 meses',
      'period.this_year':     'Este año',
      'period.all_time':      'Siempre',

      // Expenses list
      'expenses.title':              'Gastos',
      'expenses.search_placeholder': 'Buscar gastos…',
      'expenses.filter.category':    'Categoría',
      'expenses.filter.from':        'Desde',
      'expenses.filter.to':          'Hasta',
      'expenses.filter.clear':       'Limpiar filtros',
      'expenses.sort.date_desc':     'Más recientes',
      'expenses.sort.date_asc':      'Más antiguos',
      'expenses.sort.amount_desc':   'Mayor monto',
      'expenses.sort.amount_asc':    'Menor monto',
      'expenses.empty.title':        'Sin gastos aún',
      'expenses.empty.desc':         'Tocá el botón + para agregar tu primer gasto.',
      'expenses.no_results.title':   'Sin resultados',
      'expenses.no_results.desc':    'Ningún gasto coincide con tu búsqueda o filtros.',
      'expenses.clear_search':       'Limpiar búsqueda y filtros',
      'expenses.count.singular':     'gasto',
      'expenses.count.plural':       'gastos',

      // Expense form
      'form.edit_title':              'Editar gasto',
      'form.add_title':               'Agregar gasto',
      'form.save':                    'Guardar',
      'form.saving':                  'Guardando…',
      'form.update':                  'Actualizar',
      'form.save_expense':            'Guardar gasto',
      'form.cancel':                  'Cancelar',
      'form.amount':                  'Monto',
      'form.currency':                'Moneda',
      'form.date':                    'Fecha',
      'form.category':                'Categoría',
      'form.category.placeholder':    'Seleccioná una categoría…',
      'form.custom_category':         'Categoría personalizada',
      'form.custom_category.placeholder': 'Ej.: Gimnasio, Café, Hobbies',
      'form.merchant':                'Comercio / Tienda',
      'form.merchant.placeholder':    'Ej.: Amazon, Starbucks',
      'form.notes':                   'Notas',
      'form.notes.placeholder':       'Detalles adicionales…',
      'form.receipt':                 'Ticket / Recibo',
      'form.take_photo':              'Sacar foto',
      'form.upload_file':             'Subir archivo',
      'form.replace_file':            'Reemplazar archivo',

      // Validation errors
      'error.amount':          'Ingresá un monto positivo válido.',
      'error.category':        'Seleccioná una categoría.',
      'error.custom_category': 'Ingresá un nombre de categoría.',

      // Expense detail
      'detail.date':        'Fecha',
      'detail.merchant':    'Comercio',
      'detail.category':    'Categoría',
      'detail.notes':       'Notas',
      'detail.receipt':     'Ticket / Recibo',
      'detail.view_receipt':'Ver ticket',
      'detail.no_receipt':  'Sin ticket adjunto',
      'detail.add_receipt': '+ Adjuntar ticket',
      'detail.delete':      'Eliminar',
      'detail.edit':        'Editar',

      // Delete confirmation
      'delete.title':    '¿Eliminar gasto?',
      'delete.body':     'Esto eliminará permanentemente el gasto de tu Planilla de Google. Esta acción no se puede deshacer.',
      'delete.confirm':  'Eliminar',
      'delete.deleting': 'Eliminando…',
      'delete.cancel':   'Cancelar',

      // Settings
      'settings.title':               'Ajustes',
      'settings.preferences':         'Preferencias',
      'settings.dark_mode':           'Modo oscuro',
      'settings.light_mode':          'Modo claro',
      'settings.dark_mode.desc':      'Alternar apariencia oscura / clara',
      'settings.currency':            'Moneda predeterminada',
      'settings.currency.desc':       'Se completa automáticamente en nuevos gastos (opcional)',
      'settings.receipt_upload':      'Subida de tickets',
      'settings.receipt_upload.desc': 'Guardar fotos y PDFs en Google Drive',
      'settings.data':                'Datos',
      'settings.open_sheet':          'Abrir Planilla de Google',
      'settings.sheet.ready':         'Ver tu planilla de gastos',
      'settings.sheet.needs_update':  'El script necesita actualizarse — ver más abajo',
      'settings.script_version':       'Versión del script',
      'settings.script_outdated':      'Script desactualizado — se requiere actualización',
      'settings.script_outdated.desc': 'El script de Apps Script está desactualizado. Algunas funciones requieren la última versión.',
      'settings.script_update_steps':  'Cómo actualizar',
      'settings.open_appscript':       'Abrir el editor de Apps Script',
      'settings.sheet.detecting':     'Detectando…',
      'settings.sheet.not_created':   'Planilla no creada aún — agregá un gasto primero',
      'settings.relink':              'Reconectar planilla',
      'settings.relink.desc':         'Buscar o recrear la planilla ExpenseTracker',
      'settings.account':             'Cuenta',
      'settings.remove':              'Eliminar',
      'settings.sign_out':            'Cerrar sesión',
      'settings.sign_out.desc':       'Cerrar sesión y volver al inicio',
      'settings.about':               'Acerca de',
      'settings.view_github':         'Ver en GitHub',
      'settings.language':            'Idioma',
      'settings.language.desc':       'Cambiar el idioma de la app',

      // Toast messages
      'toast.welcome':             '¡Bienvenido/a, {name}!',
      'toast.sign_in_failed':      'Error al iniciar sesión. Intentá de nuevo.',
      'toast.refreshed':           'Gastos actualizados.',
      'toast.load_failed':         'Error al cargar los gastos.',
      'toast.saved_receipt_failed':'Gasto guardado, pero no se pudo subir el ticket. Reintentá desde el detalle.',
      'toast.saved':               'Gasto guardado.',
      'toast.updated':             'Gasto actualizado.',
      'toast.save_failed':         'Error al guardar. Intentá de nuevo.',
      'toast.script_needs_update': 'Script desactualizado — los ingresos requieren la última versión desplegada.',
      'toast.receipt_added':       'Ticket adjuntado.',
      'toast.receipt_failed':      'Error al subir el ticket.',
      'toast.deleted':             'Gasto eliminado.',
      'toast.delete_failed':       'Error al eliminar. Intentá de nuevo.',
      'toast.session_expired':     'Sesión expirada — iniciá sesión de nuevo.',
      'toast.settings_saved':      'Ajustes guardados.',
      'toast.sheet_url_saved':     'URL de planilla guardada.',
      'toast.script_copied':       'Script copiado al portapapeles.',
      'toast.copy_failed':         'Error al copiar — seleccioná y copiá manualmente.',
      'toast.sheet_relinked':      'Planilla reconectada.',

      // Confirm dialogs
      'confirm.discard':         '¿Descartar los cambios sin guardar?',
      'confirm.reset_connection':'¿Restablecer la configuración? Tendrás que volver a configurar la app.',
      'confirm.relink':          'Esto creará o reconectará tu Planilla de Google. ¿Continuás?',

      // Debts
      'nav.debts':                      'Deudas',
      'debts.title':                    'Deudas',
      'debts.add_debt':                 'Agregar deuda',
      'debts.empty.title':              'Sin deudas aún',
      'debts.empty.desc':               'Tocá "Agregar deuda" para registrar lo que debés.',
      'debts.show_paid':                'Mostrar pagadas',
      'debts.paid_badge':               'Pagada',
      'debts.source':                   'Acreedor / Fuente',
      'debts.source.placeholder':       'Ej.: Banco, Tarjeta, Amigo',
      'debts.date':                     'Fecha de deuda',
      'debts.total_amount':             'Monto total',
      'debts.outstanding':              'Saldo pendiente',
      'debts.due_date':                 'Fecha de vencimiento',
      'debts.notes':                    'Notas',
      'debts.notes.placeholder':        'Detalles adicionales…',
      'debts.add_title':                'Agregar deuda',
      'debts.edit_title':               'Editar deuda',
      'debts.save':                     'Guardar deuda',
      'debts.cancel':                   'Cancelar',
      'debts.pay':                      'Pagar',
      'debts.settle_full':              'Saldar deuda',
      'debts.payment_history':          'Historial de pagos',
      'debts.no_payments':              'Sin pagos registrados aún.',
      'debts.delete_confirm':           '¿Eliminar esta deuda? Esta acción no se puede deshacer.',
      'debts.payment_title':            'Registrar pago',
      'debts.payment_amount':           'Monto del pago',
      'debts.payment_date':             'Fecha del pago',
      'debts.payment_save':             'Registrar pago',
      'debts.payment_saving':           'Guardando…',
      'debts.remaining_balance':        'Saldo restante',
      'dashboard.total_outstanding':    'Total pendiente',
      'dashboard.creditor':             'acreedor',
      'dashboard.creditors':            'acreedores',
      'dashboard.view_debts':           'Ver deudas',
      'dashboard.no_debts':             'Sin deudas pendientes',
      'debts.n_debts':                  '· {n} deudas',
      'error.debt_source':              'Ingresá el nombre del acreedor.',
      'error.debt_amount':              'Ingresá un monto positivo válido.',
      'error.payment_amount':           'Ingresá un monto válido.',
      'error.payment_overpay':          'El monto no puede superar el saldo pendiente.',
      'toast.debt_saved':               'Deuda guardada.',
      'toast.debt_updated':             'Deuda actualizada.',
      'toast.debt_deleted':             'Deuda eliminada.',
      'toast.debt_save_failed':         'Error al guardar la deuda. Intentá de nuevo.',
      'toast.payment_saved':            'Pago registrado.',
      'toast.payment_save_failed':      'Error al registrar el pago. Intentá de nuevo.',

      // Income
      'nav.income':                   'Ingresos',
      'income.title':                 'Ingresos',
      'income.add_income':            'Agregar ingreso',
      'income.source':                'Fuente',
      'income.source.placeholder':    'Ej.: Sueldo, Freelance, Transferencia',
      'income.notes':                 'Notas',
      'income.notes.placeholder':     'Detalles adicionales…',
      'income.no_income_yet':         'Sin ingresos registrados aún',
      'income.no_income_desc':        'Tocá el botón + para agregar tu primer ingreso.',
      'income.carry_in':              'Arrastre',
      'income.closing_balance':       'Saldo',
      'income.month_income':          'Ingresos',
      'income.balance_adjustment':    'Ajuste de saldo',
      'income.delete_confirm':        '¿Eliminar este registro? Esta acción no se puede deshacer.',
      'income.negative_balance_hint': 'El saldo es negativo — se recomienda reconciliar.',
      'income.reconcile_btn':         'Reconciliar',
      'income.add_title':             'Agregar ingreso',
      'income.save':                  'Guardar ingreso',

      // Reconciliation
      'reconcile.title':              'Reconciliar saldo',
      'reconcile.tracked_balance':    'Saldo rastreado actual',
      'reconcile.adjustment_amount':  'Monto del ajuste',
      'reconcile.adjustment_hint':    'Positivo si el efectivo real supera el rastreado, negativo si es menor.',
      'reconcile.save':               'Guardar ajuste',

      // Dashboard income
      'dashboard.income_this_month':  'Ingresos este mes',
      'dashboard.expenses_this_month':'Gastos este mes',
      'dashboard.net_this_month':     'Neto este mes',
      'dashboard.total_carry_over':   'Saldo neto',

      // Errors
      'error.income_source':          'Ingresá la fuente del ingreso.',
      'error.income_amount':          'Ingresá un monto positivo válido.',
      'error.reconcile_amount':       'El ajuste debe ser distinto de cero.',

      // Toasts
      'toast.income_added':           'Ingreso guardado.',
      'toast.income_deleted':         'Registro eliminado.',
      'toast.reconciliation_saved':   'Ajuste de saldo guardado.',

      // Category display names (stored as English keys in Google Sheets)
      'Food & Dining':       'Comida y Restaurantes',
      'Transportation':      'Transporte',
      'Shopping':            'Compras',
      'Entertainment':       'Entretenimiento',
      'Health & Fitness':    'Salud y Deporte',
      'Housing & Utilities': 'Hogar y Servicios',
      'Travel':              'Viajes',
      'Education':           'Educación',
      'Personal Care':       'Cuidado Personal',
      'Business':            'Negocios',
      'Debt Payment':        'Pago de deuda',
      'Other':               'Otro',
    },
  };

  // ----------------------------------------------------------
  // Locale detection — reads ?lang= query param, no stored state.
  // Using a query param (not a path prefix) avoids server-side
  // routing requirements on static hosts.
  //   ?lang=es  →  es-AR
  //   (absent)  →  en-GB
  // ----------------------------------------------------------
  function detectLocale() {
    const lang = new URLSearchParams(window.location.search).get('lang');
    return lang === 'es' ? 'es-AR' : 'en-GB';
  }

  let _locale = detectLocale();

  // ----------------------------------------------------------
  // Translation lookup with en-GB fallback
  // ----------------------------------------------------------
  function t(key) {
    const dict = LOCALES[_locale];
    if (dict && key in dict) return dict[key];
    if (_locale !== 'en-GB' && key in LOCALES['en-GB']) return LOCALES['en-GB'][key];
    return key; // last resort: raw key
  }

  // ----------------------------------------------------------
  // Locale switch — adds/removes ?lang= and reloads.
  // Preserves all other query params (e.g. ?cfg=...).
  // ----------------------------------------------------------
  function switchLocale(targetLocale) {
    const url = new URL(window.location.href);
    if (targetLocale === 'es-AR') {
      url.searchParams.set('lang', 'es');
    } else {
      url.searchParams.delete('lang');
    }
    window.location.href = url.toString();
  }

  // Set lang attribute on <html> and document title immediately (before Alpine)
  document.documentElement.setAttribute('lang', _locale === 'es-AR' ? 'es' : 'en');
  document.title = t('app.title');

  return { detectLocale, t, switchLocale, locale: () => _locale };
})();

// ----------------------------------------------------------
// Expose globals for Alpine templates and app.js
// ----------------------------------------------------------
window.t              = I18n.t;
window.switchLocale   = I18n.switchLocale;
window._activeLocale  = I18n.locale();
