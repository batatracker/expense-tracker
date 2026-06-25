'use strict';

/**
 * Tests for balance arithmetic logic derived from app.js's
 * carryOverByMonth getter and totalNetBalance getter.
 *
 * These functions are pure arithmetic over arrays of income/expense entries.
 * We test the logic in isolation without loading the full Alpine component.
 */

/**
 * Replicates app.js `get totalNetBalance()`:
 * sum of all income amounts minus sum of all expense amounts.
 */
function totalNetBalance(income, expenses) {
  let total = 0;
  for (const e of income) total += parseFloat(e.amount || 0);
  for (const e of expenses) total -= parseFloat(e.amount || 0);
  return total;
}

/**
 * Replicates app.js `get carryOverByMonth()`:
 * builds a map of YYYY-MM → { carryIn, income, reconciliation, expenses, closing }.
 */
function carryOverByMonth(income, expenses) {
  const monthSet = new Set();
  for (const e of income) { if (e.date) monthSet.add(e.date.slice(0, 7)); }
  for (const e of expenses) { if (e.date) monthSet.add(e.date.slice(0, 7)); }

  const sortedMonths = [...monthSet].sort();
  const result = {};
  let runningBalance = 0;

  for (const month of sortedMonths) {
    const carryIn = runningBalance;
    let monthIncome = 0;
    let monthReconciliation = 0;
    let monthExpenses = 0;

    for (const e of income) {
      if (!e.date || e.date.slice(0, 7) !== month) continue;
      const amt = parseFloat(e.amount || 0);
      if (e.type === 'reconciliation') monthReconciliation += amt;
      else monthIncome += amt;
    }
    for (const e of expenses) {
      if (!e.date || e.date.slice(0, 7) !== month) continue;
      monthExpenses += parseFloat(e.amount || 0);
    }

    const closing = carryIn + monthIncome + monthReconciliation - monthExpenses;
    result[month] = { carryIn, income: monthIncome, reconciliation: monthReconciliation, expenses: monthExpenses, closing };
    runningBalance = closing;
  }
  return result;
}

// ── Test data fixtures ────────────────────────────────────────────────────────

const INCOME_JAN = [
  { date: '2026-01-10', amount: '2000', type: 'income' },
  { date: '2026-01-15', amount: '500',  type: 'income' },
];

const EXPENSES_JAN = [
  { date: '2026-01-05', amount: '300' },
  { date: '2026-01-20', amount: '200' },
];

const INCOME_FEB = [
  { date: '2026-02-01', amount: '1800', type: 'income' },
];

const EXPENSES_FEB = [
  { date: '2026-02-10', amount: '600' },
];

// ── totalNetBalance tests ─────────────────────────────────────────────────────

describe('totalNetBalance', () => {
  it('returns 0 when no income and no expenses', () => {
    expect(totalNetBalance([], [])).toBe(0);
  });

  it('equals total income when there are no expenses', () => {
    expect(totalNetBalance(INCOME_JAN, [])).toBe(2500);
  });

  it('returns negative when expenses exceed income', () => {
    const result = totalNetBalance([], [{ amount: '100' }]);
    expect(result).toBe(-100);
  });

  it('calculates net correctly across multiple entries', () => {
    // income: 2000 + 500 = 2500, expenses: 300 + 200 = 500, net = 2000
    expect(totalNetBalance(INCOME_JAN, EXPENSES_JAN)).toBe(2000);
  });

  it('handles string amounts correctly', () => {
    const income = [{ amount: '1000.50' }];
    const expenses = [{ amount: '250.25' }];
    expect(totalNetBalance(income, expenses)).toBeCloseTo(750.25);
  });

  it('treats missing amount as 0', () => {
    const income = [{ amount: undefined }, { amount: '100' }];
    expect(totalNetBalance(income, [])).toBe(100);
  });
});

// ── carryOverByMonth tests ────────────────────────────────────────────────────

describe('carryOverByMonth', () => {
  it('returns empty object when no data', () => {
    expect(carryOverByMonth([], [])).toEqual({});
  });

  it('calculates a single month correctly', () => {
    const result = carryOverByMonth(INCOME_JAN, EXPENSES_JAN);
    expect(result['2026-01']).toEqual({
      carryIn: 0,
      income: 2500,
      reconciliation: 0,
      expenses: 500,
      closing: 2000,
    });
  });

  it('carries over the closing balance to the next month', () => {
    const income = [...INCOME_JAN, ...INCOME_FEB];
    const expenses = [...EXPENSES_JAN, ...EXPENSES_FEB];
    const result = carryOverByMonth(income, expenses);

    // Jan: 0 + 2500 - 500 = 2000
    expect(result['2026-01'].closing).toBe(2000);
    // Feb: carry 2000 + 1800 - 600 = 3200
    expect(result['2026-02'].carryIn).toBe(2000);
    expect(result['2026-02'].closing).toBe(3200);
  });

  it('handles reconciliation entries separately from regular income', () => {
    const income = [
      { date: '2026-03-01', amount: '1000', type: 'income' },
      { date: '2026-03-15', amount: '50',   type: 'reconciliation' },
    ];
    const result = carryOverByMonth(income, []);
    expect(result['2026-03'].income).toBe(1000);
    expect(result['2026-03'].reconciliation).toBe(50);
    expect(result['2026-03'].closing).toBe(1050);
  });

  it('skips entries without a date', () => {
    const income = [
      { amount: '999' }, // no date — must be skipped
      { date: '2026-04-01', amount: '100', type: 'income' },
    ];
    const result = carryOverByMonth(income, []);
    expect(result['2026-04'].income).toBe(100);
  });

  it('produces months in chronological order', () => {
    const income = [
      { date: '2026-03-01', amount: '100', type: 'income' },
      { date: '2026-01-01', amount: '100', type: 'income' },
    ];
    const months = Object.keys(carryOverByMonth(income, []));
    expect(months).toEqual(['2026-01', '2026-03']);
  });
});
