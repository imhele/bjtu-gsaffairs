declare module '*.css';
declare module '*.png';
declare module '*.less';
declare interface Route<T = string | string[]> {
  component?: string;
  dynamic?: boolean | object[];
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
