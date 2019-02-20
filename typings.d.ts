declare module '*.css';
declare module '*.png';
declare module '*.less';
declare type Route<D extends boolean | object[] = false> =
  | {
      component?: never;
      path: string;
      redirect: string;
    }
  | {
      component?: string;
      dynamic?: D | true | object[];
      hideInMenu?: boolean;
      href?: string;
      icon?: D extends false ? string : string[] | string;
      name?: D extends false ? string : string[] | string;
      path?: string;
      redirect?: never;
      routes?: Route<D>[];
      Routes?: string[];
      scope?: D extends false ? (string | number)[] : (string | number)[] | (string | number)[][];
    };
