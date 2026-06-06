
export const CURRENCY_CODE = import.meta.env.VITE_CURRENCY || 'USD';
export const CURRENCY_SYMBOL = import.meta.env.VITE_CURRENCY_SYMBOL || '$';

export const formatCurrency = (amount: number | string | undefined | null): string => {
  if (amount === undefined || amount === null) return `${CURRENCY_SYMBOL} 0`;
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return `${CURRENCY_SYMBOL} 0`;

  // Use Intl.NumberFormat for proper formatting if needed, but for now adhering to the symbol prefix style
  // to match existing "Rs. 1,000" style.
  return `${CURRENCY_SYMBOL} ${numAmount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};
