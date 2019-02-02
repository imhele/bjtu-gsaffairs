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

export function formatRouteInfo<T>(info: T | T[], key?: number): T {
  if (!info) return null;
  if (typeof info === 'string') return info;
  if (key) return info[key];
  if (Array.isArray(info)) {
    return info[0];
  }
  return null;
}

export function formatDynamicRoute(
  route: Route<string | string[], Array<string | number> | Array<string | number>[]>,
  key?: number,
): Route {
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
    icon: formatRouteInfo<string>(route.icon, key),
    name: formatRouteInfo<string>(route.name, key),
    scope: formatRouteInfo<Array<string | number>>(route.scope, key),
    routes,
  };
}
