
/**
 * Parses a discount string like "+5", "-2", "10" or "=15"
 * Returns the calculated new value based on the current value.
 */
export const calculateDiscount = (input: string, currentValue: number): number => {
  const trimmed = input.trim();
  
  if (trimmed.startsWith('+')) {
    const val = parseFloat(trimmed.substring(1));
    return isNaN(val) ? currentValue : currentValue + val;
  }
  
  if (trimmed.startsWith('-')) {
    const val = parseFloat(trimmed.substring(1));
    return isNaN(val) ? currentValue : currentValue - val;
  }
  
  if (trimmed.startsWith('=')) {
    const val = parseFloat(trimmed.substring(1));
    return isNaN(val) ? currentValue : val;
  }

  const absoluteVal = parseFloat(trimmed);
  return isNaN(absoluteVal) ? currentValue : absoluteVal;
};

export const unitsToCartons = (units: number, packagingSize: number): string => {
  if (!packagingSize || packagingSize <= 0) return '0';
  const cartons = units / packagingSize;
  return cartons % 1 === 0 ? cartons.toString() : cartons.toFixed(2);
};

export const calculateItemNet = (price: number, quantity: number, discount: number): number => {
  const gross = price * quantity;
  return gross * (1 - discount / 100);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
