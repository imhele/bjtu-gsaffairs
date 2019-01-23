export interface Route {
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
    .map(randomStr).join(join).slice(0, length);
}

export function pathToScope(
  route: Route,
  pathname: string,
  scope = new Set(),
): Set<string | number> {
  if (!!!route || !!!pathname) return scope;
  if (Array.isArray(route.scope)) route.scope.forEach(v => scope.add(v));
  if (route.path === pathname) return scope;
  if (!Array.isArray(route.routes)) return scope;
  return pathToScope(
    route.routes.find(v => v.path && pathname.startsWith(v.path)), pathname, scope);
  // redirect path will not appear in props.route of Component in Routes[].
}
