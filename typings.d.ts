declare module '*.css';
declare module '*.png';
declare module '*.less';
declare interface Route<T = string, U = Array<string | number>> {
  component?: string;
  dynamic?: boolean | object[];
  hideInMenu?: boolean;
  href?: string;
  icon?: T;
  name?: T;
  path?: string;
  redirect?: string;
  routes?: Route<T, U>[];
  Routes?: string[];
  scope?: U;
}
