/**
 * Calculates the monthly savings based on income, expense, and monthly budget.
 * 
 * - When budget > 0: Expenses up to the monthly budget come from the budget.
 *   Only expenses exceeding the budget (Math.max(0, expense - budget)) deduct from savings/income.
 * - When budget <= 0: No monthly budget is set, so expenses come directly from income/savings (income - expense).
 */
export const calculateMonthlySavings = (income: number, expense: number, budget: number): number => {
  if (budget > 0) {
    const excessExpense = Math.max(0, expense - budget);
    return income - excessExpense;
  }
  return income - expense;
};
