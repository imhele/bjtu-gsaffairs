import ChangeCase from 'change-case';
import { DefineModelAttributes, DefineAttributeColumnOptions, Instance } from 'sequelize';

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

export const setModelInstanceMethods = <T = any, M = any>(
  model: M,
  attr: DefineModelAttributes<T>,
): M => {
  Object.assign((model as any).prototype, {
    format: function(this: Instance<T>) {
      const dataValues = this.get();
      Object.entries(dataValues).forEach(([key, value]: any) => {
        // Handle enum type
        if (attr[key] && attr[key].values && typeof value === 'number') {
          dataValues[key] = attr[key].values[value];
        }
      });
      return dataValues;
    },
    attrs: function(this: Instance<T>) {
      return Object.keys(attr);
    },
  });
  return model;
};

export const getFromIntEnum = <T = object>(
  attr: DefineModelAttributes<T>,
  key: keyof T,
  index: number | null,
  value: string,
) =>
  index === null
    ? (attr[key] as DefineAttributeColumnOptions).values!.indexOf(value)
    : (attr[key] as DefineAttributeColumnOptions).values![index];

export const factorial = (n: number) =>
  !Number.isInteger(n) || n < 0
    ? null
    : n < 2
    ? 1
    : Array.from({ length: n }).reduce<number>((p, _, c) => p * ++c, 1);

export const uniqueNum = (count: number) => {
  const base = factorial(count);
  if (base === null) return null;
  return Array.from({ length: count }).reduce<number>(
    (pre, _, cur) => pre + base / (factorial(cur)! * factorial(count - cur)!),
    1,
  );
};
