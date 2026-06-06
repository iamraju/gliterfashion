import 'dotenv/config';

export const CURRENCY = process.env.CURRENCY || 'USD';
export const CURRENCY_SYMBOL = process.env.CURRENCY_SYMBOL || '$';

export const formatCurrency = (amount: number | string | undefined | null): string => {
  if (amount === undefined || amount === null) return `${CURRENCY_SYMBOL} 0`;

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) return `${CURRENCY_SYMBOL} 0`;

  return `${CURRENCY_SYMBOL} ${numAmount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};
