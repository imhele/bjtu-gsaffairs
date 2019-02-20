import ChangeCase from 'change-case';

export const lenToArr = (arr: any[] | number) =>
  (typeof arr === 'number' ? Array.from({ length: arr }) : arr).map((_, i) => i);

type changeCaseType = 'camel' | 'snack';

export const changeCase = (type: changeCaseType, data: object | (object | string)[] | string) => {
  if (typeof data === 'string') return ChangeCase[type](data);
  if (Array.isArray(data)) return data.map(item => changeCase(type, item));
  if (typeof data === 'object') {
    const res = {};
    Object.keys(data).forEach(key => (res[changeCase(type, key)] = data[key]));
    return res;
  }
  return data;
};
