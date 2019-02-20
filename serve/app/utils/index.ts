export const lenToArr = (arr: any[] | number) =>
  (typeof arr === 'number' ? Array.from({ length: arr }) : arr).map((_, i) => i);
