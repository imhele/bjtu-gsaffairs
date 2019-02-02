declare module '*.css';
declare module '*.png';
declare module '*.less';
declare interface Route<T = string | object> {
  component?: string;
  dynamic?: boolean;
  hideInMenu?: boolean;
  href?: string;
  icon?: T;
  name?: T;
  path?: string;
  redirect?: string;
  routes?: Route<T>[];
  Routes?: string[];
  scope?: Array<string | number>;
}
