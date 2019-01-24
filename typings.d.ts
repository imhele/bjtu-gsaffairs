declare module '*.css';
declare module '*.png';
declare module '*.less';
declare interface Route {
  path?: string;
  href?: string;
  name?: string;
  icon?: string;
  redirect?: string;
  component?: string;
  hideInMenu?: boolean;
  routes?: Route[];
  Routes?: string[];
  scope?: Array<string | number>;
}
