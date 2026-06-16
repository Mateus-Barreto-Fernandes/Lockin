export const validate = {
  isNotEmpty: (val) => val !== undefined && val !== null && String(val).trim() !== '',
  isString: (val) => typeof val === 'string',
  isNumber: (val) => typeof val === 'number' && !isNaN(val),
  isValidDate: (val) => {
    if (!val || typeof val !== 'string') return false;
    const d = new Date(val);
    return d instanceof Date && !isNaN(d.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(val);
  },
  isWithinRange: (val, min, max) => {
    const n = Number(val);
    return !isNaN(n) && n >= min && n <= max;
  },
  isValidOption: (val, options) => options.includes(val),
};

export function createError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}
