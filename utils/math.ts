
/**
 * Parses a discount string like "+5", "-2", "10", "13.39%" or "=15"
 * Returns the calculated new value based on the baseValue.
 */
export const calculateDiscount = (input: string, baseValue: number): number => {
  const cleaned = input.replace(/%/g, '').trim();
  
  if (!cleaned) return baseValue;

  if (cleaned.startsWith('+')) {
    const val = parseFloat(cleaned.substring(1));
    return isNaN(val) ? baseValue : Number((baseValue + val).toFixed(2));
  }
  
  if (cleaned.startsWith('-')) {
    const val = parseFloat(cleaned.substring(1));
    return isNaN(val) ? baseValue : Number((baseValue - val).toFixed(2));
  }
  
  if (cleaned.startsWith('=')) {
    const val = parseFloat(cleaned.substring(1));
    return isNaN(val) ? baseValue : val;
  }

  // If it's a plain number, treat it as an absolute override
  const absoluteVal = parseFloat(cleaned);
  return isNaN(absoluteVal) ? baseValue : absoluteVal;
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
