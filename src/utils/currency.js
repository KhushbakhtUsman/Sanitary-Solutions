export const formatCurrency = (amount) => `Rs ${amount.toFixed(2)}`;

export const formatCurrencyWhole = (amount) => `Rs ${Math.round(amount)}`;
