export const formatCurrency = (val: unknown) => {
  const amount = Number(val);
  if (isNaN(amount)) return '₹0.00';
  return Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount);
};

export const formatDateValue = (val: unknown) => {
  if (!val) return 'None';
  const date = new Date(val as string | number | Date);
  if (isNaN(date.getTime())) return String(val);
  const day = date.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export const formatCurrencyUSD = (val: number | string | unknown) => {
  const amount = Number(val);
  if (isNaN(amount)) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};
