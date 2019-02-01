import React, { Component } from 'react';

export type Scope =
  | Set<string | number>
  | ReadonlySet<string | number>
  | Array<string | number>
  | ReadonlyArray<string | number>;

export interface AuthorizedProps {
  exception?: React.ReactNode;
  id?: any;
  scope?: Scope;
  currentScope?: Scope;
}

interface AuthorizedState {
  currentScope: Scope;
}

export const getCurrentScope: Map<any, () => Scope> = new Map();

export const setCurrentScope: Map<any, (newScope: Scope) => void> = new Map();

export const CheckAuth = (scope: Scope, currentScope: Scope) => {
  if (scope instanceof Set) scope = Array.from(scope);
  if (!Array.isArray(scope)) scope = [];
  if (currentScope instanceof Set) currentScope = Array.from(currentScope);
  if (!Array.isArray(currentScope)) currentScope = [];
  if (!scope.length) return true;
  return currentScope.some(v => {
    return (scope as Array<string | number>).some(w => w === v);
  });
};

export default class Authorized extends Component<AuthorizedProps, AuthorizedState> {
  state: AuthorizedState = {
    currentScope: [],
  };

  constructor(props: AuthorizedProps) {
    super(props);
    if (typeof props.id !== 'undefined') {
      getCurrentScope.set(props.id, this.getCurrentScope);
      setCurrentScope.set(props.id, this.setCurrentScope);
      this.state.currentScope = props.currentScope || [];
    }
  }

  getCurrentScope = (): Scope => this.state.currentScope;

  setCurrentScope = (newScope: Scope) => {
    this.setState({ currentScope: newScope });
  };

  render() {
    const { currentScope: stateCurrentScope } = this.state;
    const { children, currentScope, exception, scope } = this.props;
    if (CheckAuth(scope, currentScope || stateCurrentScope)) {
      return children;
    } else {
      return exception;
    }
  }
}
