import currency from 'currency.js';

/**
 * Format a number as currency with the specified currency code
 * @param amount The amount to format
 * @param currencyCode The ISO 4217 currency code (e.g., 'USD', 'EUR')
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
  // Map currencies to their primary country's locale
  const currencyLocaleMap: Record<string, string> = {
    'USD': 'en-US',
    'EUR': 'de-DE',
    'GBP': 'en-GB',
    'JPY': 'ja-JP',
    'CNY': 'zh-CN',
    'SEK': 'sv-SE',
    'NOK': 'nb-NO',
    'DKK': 'da-DK',
    'PLN': 'pl-PL',
    'RUB': 'ru-RU',
    'INR': 'hi-IN',
    'BRL': 'pt-BR',
    'MXN': 'es-MX',
    'CAD': 'en-CA',
    'AUD': 'en-AU',
    'CHF': 'de-CH'
  };
  
  try {
    // Use the currency's native locale for formatting
    const locale = currencyLocaleMap[currencyCode] || navigator.language || 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fall back to the original implementation if Intl.NumberFormat fails
    const symbol = getCurrencySymbol(currencyCode);
    
    // Check if the symbol is the same as the currency code (like "SEK", "NOK")
    // These currencies typically display with a space
    const isCodeAsSymbol = symbol === currencyCode || symbol.length > 1;
    
    return currency(amount, { 
      symbol: symbol,
      precision: 2,
      // Add a space for currencies that use their code as symbol
      pattern: isCodeAsSymbol ? '! #' : '!#'
    }).format();
  }
};

/**
 * Get the currency symbol for a given currency code
 * @param currencyCode The ISO 4217 currency code (e.g., 'USD', 'EUR')
 * @returns The currency symbol (e.g., '$', '€')
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .formatToParts(0)
      .find(part => part.type === 'currency')?.value || currencyCode;
  } catch (error) {
    return currencyCode;
  }
};

/**
 * Calculate and format a percentage
 * @param value The value to calculate percentage from
 * @param total The total value
 * @returns Formatted percentage string
 */
export const calculatePercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}; 