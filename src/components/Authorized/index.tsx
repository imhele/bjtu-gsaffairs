export interface AuthorizedProps {
  exception?: React.ReactNode | null;
  scope?: Set<string | number> | ReadonlySet<string | number>;
  currentScope?: Array<string | number> | ReadonlyArray<string | number>;
}

export type AuthorizedComponent<P> = (
  props: P & {
    children?: React.ReactNode;
  },
) => React.ReactNode | null;

const Authorized: AuthorizedComponent<AuthorizedProps> = props => {
  const { exception = null, scope = new Set(), currentScope = [] } = props;
  if (scope.size) {
    const res = currentScope.find(v => scope.has(v));
    if (res === undefined) return exception;
  }
  return props.children;
};

export default Authorized;
