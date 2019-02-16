export const strOrReg = (a: string | RegExp, b: string): boolean => {
  if (typeof a === 'string') return a.includes(b);
  if (a instanceof RegExp) return a.test(b);
  return false;
};

export const formatCSSUnit = (n: string | number, ...defaultValue: (string | number)[]): string => {
  if (n === void 0) {
    const v = defaultValue.find(d => d !== void 0) || '';
    return typeof v === 'number' ? `${v < 0 ? ` - ${v}` : ` + ${v}`}px` : v;
  }
  return typeof n === 'number' ? `${n < 0 ? ` - ${n}` : ` + ${n}`}px` : n;
}
