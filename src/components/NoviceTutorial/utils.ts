export const strOrReg = (a: string | RegExp, b: string): boolean => {
  if (typeof a === 'string') return a.includes(b);
  if (a instanceof RegExp) return a.test(b);
  return false;
};
