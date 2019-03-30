import ChangeCase from 'change-case';
import { SimpleFormItemType } from '../link';
import { DefineModelAttributes, DefineAttributeColumnOptions, Instance } from 'sequelize';
// import { SimpleFormItemProps, SimpleFormItemType } from '../../../src/components/SimpleForm';

export const lenToArr = (arr: any[] | number) =>
  (typeof arr === 'number' ? Array.from({ length: arr }) : arr).map((_, i) => i);

type changeCaseType = 'camel' | 'snack';

export function randomStr(): string {
  // tslint:disable-next-line
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

export function UUID(length = 32, join = ''): string {
  const sec: number = join.length + 4;
  const num: number = Math.ceil(length / sec);
  return Array.from({ length: num })
    .map(randomStr)
    .join(join)
    .slice(0, length);
}

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
  Object.assign(model, {
    toForm: (fields?: string[], exclude: boolean = false): SimpleFormItemProps[] =>
      (fields
        ? exclude
          ? Object.keys(attr).filter(i => !fields.includes(i))
          : fields
        : Object.keys(attr)
      ).map(
        (id): SimpleFormItemProps => {
          const res = {
            id,
            decoratorOptions: { rules: [] },
            itemProps: {},
            title: attr[id].comment,
            type: SimpleFormItemType.Input,
          } as SimpleFormItemProps;
          if (attr[id].values) {
            res.type = SimpleFormItemType.ButtonRadio;
            res.selectOptions =
              'values' in attr[id].type
                ? attr[id].values.map((value: string) => ({
                    value,
                  }))
                : attr[id].values.map((title: string, value: number) => ({
                    title,
                    value,
                  }));
          } else if (!('_binary' in attr[id].type) && !('_zerofill' in attr[id].type)) {
            res.type = SimpleFormItemType.TextArea;
            res.itemProps.autosize = { minRows: 2 };
          }
          if (attr[id].validate) {
            if (attr[id].validate.isInt) res.type = SimpleFormItemType.InputNumber;
            if (attr[id].validate.isDate) {
              res.type = SimpleFormItemType.DatePicker;
              if ('_length' in attr[id].type) res.itemProps.showTime = true;
            }
            if (attr[id].validate.notEmpty)
              res.decoratorOptions!.rules!.push({ required: true, message: '必填项' });
            if (attr[id].validate.min !== void 0) {
              res.itemProps!.min = attr[id].validate.min;
              res.itemProps!.placeholder = `请输入不小于 ${attr[id].validate.min} 的数字`;
            }
            if (attr[id].validate.max !== void 0) {
              res.itemProps!.max = attr[id].validate.max;
              res.itemProps!.placeholder = `请输入不超过 ${attr[id].validate.max} 的数字`;
            }
            if (attr[id].validate.min !== void 0 && attr[id].validate.max !== void 0) {
              res.itemProps!.placeholder = `请输入 ${attr[id].validate.min} ~ ${
                attr[id].validate.max
              } 之间的数字`;
            }
            if (attr[id].validate.len) {
              res.itemProps!.placeholder = `长度不能超过 ${attr[id].validate.len[1]} 个字符`;
              res.decoratorOptions!.rules!.push({
                max: attr[id].validate.len[1],
                message: res.itemProps!.placeholder,
              });
              if (attr[id].validate.len[0])
                res.decoratorOptions!.rules!.push({
                  min: attr[id].validate.len[0],
                  message: `长度不能少于 ${attr[id].validate.len[1]} 个字符`,
                });
            }
          }
          if (attr[id].tip) res.tip = attr[id].tip;
          return res;
        },
      ),
    formatBack: (values: { [key: string]: any }) => {
      Object.entries(values).forEach(([key, value]: any) => {
        // Handle enum type
        if (attr[key] && attr[key].values && typeof value === 'string') {
          values[key] = attr[key].values.indexOf(value);
        }
      });
      return values;
    },
  });
  return model;
};

export const getFromIntEnum = <T = object>(
  attr: DefineModelAttributes<T>,
  key: keyof T,
  index: number | null,
  value?: string,
) =>
  index === null
    ? (attr[key] as DefineAttributeColumnOptions).values!.indexOf(value!)
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

export const parseJSON = (v: any) => {
  if (typeof v !== 'string' || !v) return v;
  try {
    return JSON.parse(v);
  } catch {
    return v;
  }
};
