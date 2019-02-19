import moment from 'moment';
import qs from 'querystring';
import { TypeSpaceChar } from '@/global';
import pathToRegexp from 'path-to-regexp';
import { SimpleFormItemProps, SimpleFormItemType } from '@/components/SimpleForm';
import {
  DatePickerProps,
  MonthPickerProps,
  WeekPickerProps,
  RangePickerProps,
} from 'antd/es/date-picker/interface';

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
  formItems: (SimpleFormItemProps & { enabledTimeRange: moment.Moment[] })[],
  init?: object,
) => {
  if (typeof init !== 'object') init = {};
  const res = {};
  formItems.forEach(item => {
    try {
      switch (item.type) {
        case SimpleFormItemType.DatePicker:
          if (init[item.id]) res[item.id] = moment(init[item.id]);
          if (Array.isArray(item.enabledTimeRange)) {
            // string => Moment
            item.enabledTimeRange[0] = moment(item.enabledTimeRange[0]);
            item.enabledTimeRange[1] = moment(item.enabledTimeRange[1]);
            item.itemProps = {
              ...item.itemProps,
              disabledDate: current =>
                !current ||
                item.enabledTimeRange[0] > current ||
                current > item.enabledTimeRange[1],
            } as DatePickerProps;
          }
          break;
        case SimpleFormItemType.MonthPicker:
          if (init[item.id]) res[item.id] = moment(init[item.id]);
          if (Array.isArray(item.enabledTimeRange)) {
            item.enabledTimeRange[0] = moment(item.enabledTimeRange[0]);
            item.enabledTimeRange[1] = moment(item.enabledTimeRange[1]);
            item.itemProps = {
              ...item.itemProps,
              disabledDate: current =>
                !current ||
                item.enabledTimeRange[0] > current ||
                current > item.enabledTimeRange[1],
            } as MonthPickerProps;
          }
          break;
        case SimpleFormItemType.WeekPicker:
          if (init[item.id]) res[item.id] = moment(init[item.id]);
          if (Array.isArray(item.enabledTimeRange)) {
            item.enabledTimeRange[0] = moment(item.enabledTimeRange[0]);
            item.enabledTimeRange[1] = moment(item.enabledTimeRange[1]);
            item.itemProps = {
              ...item.itemProps,
              disabledDate: current =>
                !current ||
                item.enabledTimeRange[0] > current ||
                current > item.enabledTimeRange[1],
            } as WeekPickerProps;
          }
          break;
        case SimpleFormItemType.RangePicker:
          if (Array.isArray(init[item.id])) {
            res[item.id] = [moment(init[item.id][0]), moment(init[item.id][1])];
          }
          if (Array.isArray(item.enabledTimeRange)) {
            item.enabledTimeRange[0] = moment(item.enabledTimeRange[0]);
            item.enabledTimeRange[1] = moment(item.enabledTimeRange[1]);
            item.itemProps = {
              ...item.itemProps,
              disabledDate: current =>
                !current ||
                item.enabledTimeRange[0] > current ||
                current > item.enabledTimeRange[1],
            } as RangePickerProps;
          }
          break;
        default:
          if (init[item.id]) res[item.id] = init[item.id];
          break;
      }
    } catch {}
  });
  return res;
};

export const formatStrOrNumQuery = {
  parse: (query: string, char: string = TypeSpaceChar): Map<string | number, string | number> => {
    const res = new Map();
    if (typeof query !== 'string' || !query) return res;
    if (query[0] === '?') query = query.slice(1);
    Object.entries(qs.parse(query)).forEach(([k, v]) => {
      if (Array.isArray(v)) return;
      const t = k.split(char);
      const u = v.split(char);
      if (t[0] === 'number') {
        if (u[0] === 'number') res.set(parseInt(t[1], 10), parseInt(u[1], 10));
        else if (u[0] === 'string') res.set(parseInt(t[1], 10), u[1]);
        else res.set(parseInt(t[1], 10), v);
      } else if (t[0] === 'string') {
        if (u[0] === 'number') res.set(t[1], parseInt(u[1], 10));
        else if (u[0] === 'string') res.set(t[1], u[1]);
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
    char: string = TypeSpaceChar,
  ): string => {
    if (typeof query !== 'object') return '';
    const res = {};
    Object.entries(query).forEach(([k, v]) => {
      if (typeof k === 'number') {
        if (typeof v === 'number') res[`number${char}${k}`] = `number${char}${v}`;
        else res[`number${char}${k}`] = `string${char}${v}`;
      } else {
        if (typeof v === 'number') res[`string${char}${k}`] = `number${char}${v}`;
        else res[`string${char}${k}`] = `string${char}${v}`;
      }
    });
    return qs.stringify(res);
  },
};

export function formatRouteInfo<T>(info: T | T[], key?: number): T {
  if (!info) return null;
  if (typeof info === 'string') return info;
  if (key) return info[key];
  if (Array.isArray(info)) return info[0];
  return null;
}

export function formatDynamicRoute(route: Route<true>, key?: number): Route {
  if (typeof route !== 'object') return route;
  let routes: Route[] = [];
  if (Array.isArray(route.routes) && route.routes.length) {
    route.routes
      .filter(item => item)
      .forEach(item => {
        if (!item.dynamic) routes.push(formatDynamicRoute(item));
        if (Array.isArray(item.dynamic)) {
          const toPath = pathToRegexp.compile(item.path);
          item.dynamic.forEach((val, index) => {
            routes.push(formatDynamicRoute({ ...item, path: toPath(val) }, index));
          });
        }
      });
  } else {
    routes = route.routes as Route[];
  }
  return {
    ...route,
    icon: route.dynamic ? formatRouteInfo<string>(route.icon, key) : (route.icon as string),
    name: route.dynamic ? formatRouteInfo<string>(route.name, key) : (route.name as string),
    scope: route.dynamic
      ? formatRouteInfo<Array<string | number>>(route.scope, key)
      : (route.scope as Array<string | number>),
    routes,
  };
}
