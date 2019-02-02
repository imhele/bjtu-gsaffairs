import pathToRegexp from 'path-to-regexp';

export function pathnameToArr(pathname = ''): string[] {
  const pathnameArr: string[] = pathname.split('/').filter(i => i);
  return pathnameArr.map((_, i) => `/${pathnameArr.slice(0, i + 1).join('/')}`);
}

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

export function pathToScope(
  route: Route,
  pathname: string,
  scope: Set<string | number> = new Set(),
): Set<string | number> {
  if (!!!route || !!!pathname) return scope;
  if (Array.isArray(route.scope)) route.scope.forEach(v => scope.add(v));
  if (route.path === pathname) return scope;
  if (!Array.isArray(route.routes)) return scope;
  return pathToScope(
    route.routes.find(v => v.path && pathToRegexp(`${v.path}(.*)`).test(pathname)),
    pathname,
    scope,
  );
  // redirect path will not appear in props.route of Component in Routes[].
}

export function groupByAmount<T = any>(arr: T[], amount: number): T[][] {
  if (!Array.isArray(arr) || arr.length <= amount) return [arr];
  const res: T[][] = [];
  arr.forEach((value, index) => {
    const group = index % amount;
    if (group) res[(index - group) / amount].push(value);
    else res.push([value]);
  });
  return res;
}

export const addWindowEvent = (() => {
  const windowEvents: Map<string, Map<string, Function>> = new Map();
  return <T extends keyof WindowEventMap>(
    type: T,
    id: string,
    fn: (event: WindowEventMap[T]) => void,
  ) => {
    if (!(windowEvents.get(type) instanceof Map)) {
      windowEvents.set(type, new Map());
      if (window[`on${type}`] !== null) {
        console.warn(
          `[addWindowEvent]`,
          `You seem to be adding event listeners to an existing value.`,
        );
      }
      window[`on${type}`] = (event: WindowEventMap[T]) => {
        windowEvents.get(type).forEach((value, key, funMap) => {
          if (typeof value !== 'function') return;
          try {
            value(event);
          } catch {
            funMap.delete(key);
          }
        });
      };
    }
    windowEvents.get(type).set(id, fn);
  };
})();

export function sandwichArray<T = any, U = any, V = any>(
  arr: T[],
  join: U | U[],
  interval: number = 1,
  wrap: boolean = false,
  handleJoin: (join: U | U[], value: T, index: number) => U | V | U[] | V[] = v => v,
) {
  if (!Array.isArray(arr)) return arr;
  const res: Array<T | U | V> = [];
  arr.forEach((value, index) => {
    if (!(index % interval)) {
      const handled = handleJoin(join, value, index);
      res.push(...(Array.isArray(handled) ? handled : [handled]));
    }
    res.push(value);
  });
  if (wrap) {
    return res.concat(handleJoin(join, undefined, undefined));
  }
  res.splice(0, 1);
  return res;
}

export function formatRouteInfo(info: string | object, key?: string): string {
  if (!info) return '';
  if (typeof info === 'string') return info;
  if (key) return info[key];
  if (typeof info === 'object') {
    const keys = Object.keys(info);
    if (keys.length) {
      return info[key || keys[0]];
    }
  }
  return '';
}

export function formatDynamicRoute(route: Route): Route<string> {
  if (!route || !Array.isArray(route.routes) || !route.routes.length) {
    return route as Route<string>;
  }
  const routes: Route<string>[] = [];
  route.routes.forEach(item => {
    if (!item.dynamic) routes.push(item as Route<string>);
    /**
     * @TODO
     */
  });
  return {
    ...route,
    icon: formatRouteInfo(route.icon),
    name: formatRouteInfo(route.name),
    routes,
  };
}
