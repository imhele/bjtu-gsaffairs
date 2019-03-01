import React, { Component } from 'react';

export type Scope = Set<string | number> | Array<string | number>;

export type CurrentScope = Scope | { include?: Scope; exclude?: Scope };

export interface AuthorizedProps {
  exception?: React.ReactNode;
  id?: any;
  scope?: Scope;
  currentScope?: CurrentScope;
}

const formatCurrentScope = (
  currentScope: CurrentScope,
): {
  include?: ReadonlyArray<string | number>;
  exclude?: ReadonlyArray<string | number>;
} => {
  if (!currentScope) return { include: [], exclude: [] };
  if (Array.isArray(currentScope)) return { include: currentScope, exclude: [] };
  if (currentScope instanceof Set) return { include: Array.from(currentScope), exclude: [] };
  const include = currentScope.include
    ? Array.isArray(currentScope.include)
      ? currentScope.include
      : Array.from(currentScope.include)
    : [];
  const exclude = currentScope.exclude
    ? Array.isArray(currentScope.exclude)
      ? currentScope.exclude
      : Array.from(currentScope.exclude)
    : [];
  return { include, exclude };
};

export const getCurrentScope: Map<any, () => CurrentScope> = new Map();

export const CheckAuth = (scope: Scope, currentScope: CurrentScope = [], id?: any) => {
  if (scope instanceof Set) scope = Array.from(scope);
  if (!Array.isArray(scope)) scope = [];
  if (!scope.length) return true;
  if (!currentScope) currentScope = getCurrentScope.get(id)() || currentScope;
  const formattedCurrentScope = formatCurrentScope(currentScope);
  return (
    formattedCurrentScope.include.some(v => (scope as Array<string | number>).some(w => w === v)) &&
    !formattedCurrentScope.exclude.some(v => (scope as Array<string | number>).some(w => w === v))
  );
};

export default class Authorized extends Component<AuthorizedProps> {
  static defaultProps: AuthorizedProps = {
    currentScope: [],
    exception: null,
    scope: [],
  };

  constructor(props: AuthorizedProps) {
    super(props);
    getCurrentScope.set(props.id, this.getCurrentScope);
  }

  // shouldComponentUpdate = (nextProps: AuthorizedProps) => {
  //   let { scope } = this.props;
  //   let { scope: nextScope } = nextProps;
  //   if (scope instanceof Set) scope = Array.from(scope);
  //   if (!Array.isArray(scope)) scope = [];
  //   if (nextScope instanceof Set) nextScope = Array.from(scope);
  //   if (!Array.isArray(nextScope)) nextScope = [];
  //   if (scope.length !== nextScope.length) return true;
  //   return nextScope.some((item, index) => item !== scope[index]);
  // };

  getCurrentScope = (): CurrentScope => this.props.currentScope;

  render() {
    const { children, currentScope, exception, scope } = this.props;
    if (CheckAuth(scope, currentScope)) {
      return children;
    } else {
      return exception;
    }
  }
}
