import moment from 'moment';
import qs from 'querystring';
import { SimpleFormItemProps, SimpleFormItemType } from '@/components/SimpleForm';

export const formatMoment = {
  Y: 'YYYY',
  YM: 'YYYY-MM',
  YMD: 'YYYY-MM-DD',
  YMDH: 'YYYY-MM-DD HH',
  YMDHm: 'YYYY-MM-DD HH:mm',
  YMDHms: 'YYYY-MM-DD HH:mm:ss',
  M: 'MM',
  MD: 'MM-DD',
  MDH: 'MM-DD HH',
  MDHm: 'MM-DD HH:mm',
  MDHms: 'MM-DD HH:mm:ss',
  D: 'DD',
  DH: 'DD HH',
  DHm: 'DD HH:mm',
  DHms: 'DD HH:mm:ss',
  H: 'HH',
  Hm: 'HH:mm',
  Hms: 'HH:mm:ss',
};

export const formatMomentInFieldsValue = (values: object, format: string): object | string => {
  if (moment.isMoment(values)) return values.format(format);
  if (typeof values !== 'object') return values;
  Object.entries(values).forEach(([k, v]) => {
    if (moment.isMoment(v)) {
      values[k] = v.format(format);
    } else if (Array.isArray(v)) {
      values[k] = v.map(i => formatMomentInFieldsValue(i, format));
    } else {
      try {
        values[k] = formatMomentInFieldsValue(v, format);
      } catch {}
    }
  });
  return values;
};

export const formatMomentInSimpleFormInitValue = (
  formItems: SimpleFormItemProps[],
  init?: object,
) => {
  if (typeof init !== 'object') return {};
  const res = {};
  formItems.forEach(item => {
    if (!init[item.id]) return;
    try {
      switch (item.type) {
        case SimpleFormItemType.DatePicker:
          res[item.id] = moment(init[item.id]);
          break;
        case SimpleFormItemType.MonthPicker:
          res[item.id] = moment(init[item.id]);
          break;
        case SimpleFormItemType.WeekPicker:
          res[item.id] = moment(init[item.id]);
          break;
        case SimpleFormItemType.RangePicker:
          if (Array.isArray(init[item.id])) {
            res[item.id] = [moment(init[item.id][0]), moment(init[item.id][1])];
          }
          break;
        default:
          res[item.id] = init[item.id];
          break;
      }
    } catch {}
  });
  return res;
};

export const formatStrOrNumQuery = {
  parse: (query: string, char: string = '|'): Map<string | number, string | number> => {
    const res = new Map();
    if (typeof query !== 'string' || !query) return res;
    if (query[0] === '?') query = query.slice(1);
    Object.entries(qs.parse(query)).forEach(([k, v]) => {
      if (Array.isArray(v)) return;
      const t = k.split(char);
      const u = v.split(char);
      if (t[0] === 'num') {
        if (u[0] === 'num') res.set(parseInt(t[1], 10), parseInt(u[1], 10));
        else if (u[0] === 'str') res.set(parseInt(t[1], 10), u[1]);
        else res.set(parseInt(t[1], 10), v);
      } else if (t[0] === 'str') {
        if (u[0] === 'num') res.set(t[1], parseInt(u[1], 10));
        else if (u[0] === 'str') res.set(t[1], u[1]);
        else res.set(t[1], v);
      } else {
        res.set(k, v);
      }
    });
    return res;
  },
  stringify: (
    query: {
      [key: string]: string | number;
      [key: number]: string | number;
    },
    char: string = '|',
  ): string => {
    if (typeof query !== 'object') return '';
    const res = {};
    Object.entries(query).forEach(([k, v]) => {
      if (typeof k === 'number') {
        if (typeof v === 'number') res[`num${char}${k}`] = `num${char}${v}`;
        else res[`num${char}${k}`] = `str${char}${v}`;
      } else {
        if (typeof v === 'number') res[`str${char}${k}`] = `num${char}${v}`;
        else res[`str${char}${k}`] = `str${char}${v}`;
      }
    });
    return qs.stringify(res);
  },
};
