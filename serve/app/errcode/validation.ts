import { lenToArr } from '../utils';
import { ValidationErrorItem } from 'sequelize';

export const enumValid = (arr: object | any[]) => ({
  notInEnum: (v: any) => {
    if (!(Array.isArray(arr) ? arr : Object.values(arr)).includes(v))
      throw new ValidationErrorItem('', '', '', v);
  },
});

export const intEnumValid = (arr: any[] | number | object) => {
  const numArr = lenToArr(Array.isArray(arr) || typeof arr === 'number' ? arr : Object.keys(arr));
  return {
    notInEnum: (v: any) => {
      if (!numArr.includes(v)) throw new ValidationErrorItem('', '', '', v);
    },
  };
};

export const ValidationMessage: {
  [key: string]: (v: string, k: string, len?: [number, number]) => string;
} = {
  is: v => `${v}不正确`, // same as the previous example using real RegExp
  not: v => `${v}不符合规范`, // will not allow letters
  isEmail: v => `${v}不是邮箱地址`, // checks for email format (foo@bar.com)
  isUrl: v => `${v}不是规范的链接`, // checks for url format (http://foo.com)
  isIP: v => `${v}不是 IP 地址`, // checks for IPv4 (129.89.23.1) or IPv6 format
  isIPv4: v => `${v}不是 IPv4 地址`, // checks for IPv4 (129.89.23.1)
  isIPv6: v => `${v}不是 IPv6 地址`, // checks for IPv6 format
  isAlpha: v => `${v}只能包含字符`, // will only allow letters
  isAlphanumeric: v => `${v}只能包含英文字符`, // will only allow alphanumeric characters, so "_abc" will fail
  isNumeric: v => `${v}只能是数字`, // will only allow numbers
  isInt: v => `${v}只能是整数`, // checks for valid integers
  isFloat: v => `${v}只能是小数`, // checks for valid floating point numbers
  isDecimal: v => `${v}只能是十进制数字`, // checks for any numbers
  isLowercase: v => `${v}只能全部小写`, // checks for lowercase
  isUppercase: v => `${v}只能全部大写`, // checks for uppercase
  notNull: (_, k) => `${k}不能为 NULL`, // won't allow null
  isNull: (_, k) => `${k}只能为 NULL`, // only allows null
  notEmpty: (_, k) => `${k}不能为空`, // don't allow empty strings
  equals: v => `${v}不正确`, // only allow a specific value
  contains: v => `${v}不符合规范`, // force specific substrings
  notIn: v => `${v}不符合规范`, // check the value is not one of these
  isIn: v => `${v}不符合规范`, // check the value is one of these
  notContains: v => `${v}不符合规范`, // don't allow specific substrings
  len: (v, _, len) => (len ? `${v}长度必须在 ${len.join(' ~ ')} 之间` : `${v}长度不在限制范围内`), // only allow values with length between 2 and 10
  isUUID: v => `${v}不符合规范`, // only allow uuids
  isDate: v => `${v}不是规范的日期`, // only allow date strings
  isAfter: v => `${v}超出允许的时间之外`, // only allow date strings after a specific date
  isBefore: v => `${v}超出允许的时间之外`, // only allow date strings before a specific date
  max: v => `${v}超过最大值`, // only allow values <= 23
  min: v => `${v}小于最小值`, // only allow values >= 23
  isCreditCard: v => `${v}不是正确的卡号`, // check for valid credit card numbers
  notInEnum: v => `${v}不符合规范`,
};
