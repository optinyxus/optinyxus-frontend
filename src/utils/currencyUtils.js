/**
 * Formats a value as Indian Rupee currency (₹)
 * @param {number|string} value - The value to format
 * @returns {string} - Formatted currency string or "-" if value is null/undefined
 */
export const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '' || value === '-') {
        return '-';
    }

    const num = Number(value);
    if (isNaN(num)) return value;

    // Use Intl.NumberFormat with Indian format as requested
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0, // Keep it clean for whole numbers
        maximumFractionDigits: 2
    }).format(num);
};

/**
 * Formats a value as a plain number using Indian locale (en-IN)
 * @param {number|string} value - The value to format
 * @param {number} fractionDigits - Number of fraction digits (optional)
 * @returns {string} - Formatted number string or "-" if value is null/undefined
 */
export const formatNumber = (value, fractionDigits = 2) => {
    if (value === null || value === undefined || value === '' || value === '-') {
        return '-';
    }

    const num = Number(value);
    if (isNaN(num)) return value;

    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: fractionDigits
    }).format(num);
};

export default formatCurrency;
