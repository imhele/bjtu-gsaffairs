import pathToRegexp from 'path-to-regexp';
import { formatDynamicRoute } from './format';
import { CheckAuth } from '@/components/Authorized';

export * from './format';

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
  scope: (string | number)[] = [],
): (string | number)[] {
  if (!!!route || !!!pathname) return scope;
  if (Array.isArray(route.scope)) scope = route.scope;
  if (route.path === pathname) return scope;
  if (!Array.isArray(route.routes)) return scope;
  return pathToScope(
    route.routes.find(v => v.path && pathToRegexp(`${v.path}(.*)`).test(pathname)),
    pathname,
    scope,
  );
  /**
   * redirect path will not appear in props.route of Component in Routes[].
   * Ref: https://umijs.org/config/#disableredirecthoist
   */
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

export const { addWindowEvent, getWindowEvent, removeWindowEvent } = (() => {
  const windowEvents: Map<
    keyof WindowEventMap,
    Map<string, (event: WindowEventMap[keyof WindowEventMap]) => void>
  > = new Map();
  return {
    addWindowEvent: <T extends keyof WindowEventMap>(
      type: T,
      id: string,
      fn: (event: WindowEventMap[T]) => void,
    ) => {
      if (!(windowEvents.get(type) instanceof Map)) {
        windowEvents.set(type, new Map());
        if (window[`on${type}`] !== null) {
          // tslint:disable-next-line
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
    },
    getWindowEvent: <T extends keyof WindowEventMap>(
      type: T,
      id: string,
    ): ((event: WindowEventMap[T]) => void) | undefined => {
      if (windowEvents.get(type) instanceof Map) {
        return windowEvents.get(type).get(id);
      }
      return void 0;
    },
    removeWindowEvent: <T extends keyof WindowEventMap>(type: T, id: string): boolean => {
      if (windowEvents.get(type) instanceof Map) {
        return windowEvents.get(type).delete(id);
      }
      return false;
    },
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
  const res: Array<T | U | V> = arr.reduce(
    (preValue, curValue, curIndex) =>
      curIndex % interval
        ? preValue.concat(curValue)
        : preValue.concat(handleJoin(join, curValue, curIndex), curValue),
    [],
  );
  if (wrap) {
    return res.concat(handleJoin(join, void 0, void 0));
  }
  res.splice(0, 1);
  return res;
}

export function safeFun<T = any>(fn: Function, defaultReturn?: T, ...args: any[]): T {
  if (typeof fn !== 'function') return defaultReturn;
  try {
    return fn(...args);
  } catch (err) {
    return typeof defaultReturn === 'undefined' ? err : defaultReturn;
  }
}

export const scrollToTop = () => {
  try {
    return window.scrollTo(null, 0);
  } catch {
    return;
  }
};

export const inheritScope = (route: Route, parentScope: (string | number)[] = []): Route => {
  if (route.scope) {
    const scope = parentScope.concat(route.scope);
    return {
      ...route,
      scope,
      routes: Array.isArray(route.routes)
        ? route.routes.filter(item => item.path).map(item => inheritScope(item, scope))
        : route.routes,
    };
  }
  return {
    ...route,
    routes: Array.isArray(route.routes)
      ? route.routes.filter(item => item.path).map(item => inheritScope(item, parentScope))
      : route.routes,
  };
};

const filterScopeRouteItem = (route: Route, currentScope: (string | number)[] = []): Route => {
  if (!Array.isArray(route.routes)) return { ...route, routes: void 0 };
  const routes = route.routes
    .filter(child => CheckAuth(child.scope, currentScope))
    .map(child => filterScopeRouteItem(child, currentScope));
  if (!routes.length) return { ...route, routes: route.component ? void 0 : null };
  return { ...route, routes };
};

export const filterScopeRoute = (
  route: Route<string | string[], Array<string | number> | Array<string | number>[]>,
  currentScope: (string | number)[] = [],
): Route =>
  Array.isArray(currentScope)
    ? filterScopeRouteItem(inheritScope(formatDynamicRoute(route)), currentScope)
    : inheritScope(formatDynamicRoute(route));
