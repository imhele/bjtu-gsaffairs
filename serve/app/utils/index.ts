import ChangeCase from 'change-case';
import { DefineModelAttributes, Instance, Model } from 'sequelize';

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

export const setModelInstanceMethods = <T = any, M = any>(model: M, attr: DefineModelAttributes<T>): M => {
  Object.assign((model as any).prototype, {
    format: function(this: Instance<T>) {
      const dataValues = this.get();
      Object.entries(attr).forEach(([key, value]: any) => {
        // Handle enum type
        if (value.values && typeof dataValues[key] === 'number') {
          dataValues[key] = value.values[dataValues[key]];
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
