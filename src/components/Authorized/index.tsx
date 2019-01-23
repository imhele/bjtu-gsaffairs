export type Scope =
  | Set<string | number>
  | ReadonlySet<string | number>
  | Array<string | number>
  | ReadonlyArray<string | number>;

export interface AuthorizedProps {
  exception?: React.ReactNode | null;
  scope?: Scope;
  currentScope?: Scope;
}

export type AuthorizedComponent<P> = (
  props: P & {
    children?: React.ReactNode;
  },
) => React.ReactNode | null;

export const CheckAuth = (scope: Scope, currentScope: Scope) => {
  scope = Array.from(scope || []);
  currentScope = Array.from(currentScope || []);
  if (!scope.length) return true;
  return currentScope.some(v => {
    return (scope as Array<string | number>).some(w => w === v);
  });
};

const Authorized: AuthorizedComponent<AuthorizedProps> = props => {
  if (CheckAuth(props.scope, props.currentScope)) {
    return props.children;
  } else {
    return props.exception;
  }
};

export default Authorized;
