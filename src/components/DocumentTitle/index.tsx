import { Component } from 'react';
import { formatMessage } from 'umi-plugin-locale';

export interface DocumentTitleProps {
  defaultTitle?: string;
  location: Location;
  route: Route;
  spacer?: string;
}

interface DocumentTitleStates {
  pathname: string;
}

export const routeToTitle = (
  routes: Route[],
  props: DocumentTitleProps,
  defaultTitle: string,
  upperRouteName: string = '',
): string => {
  const { pathname } = props.location;
  const { spacer = ' - ' } = props;
  if (!Array.isArray(routes)) return defaultTitle;
  const route = routes
    .filter(({ path, name, redirect }) => path && name && !redirect)
    .find(({ path }) => pathname.startsWith(path));
  if (!route) return upperRouteName || defaultTitle;
  const formatted = formatMessage({
    id: route.name,
    defaultMessage: route.name,
  });
  if (upperRouteName) return `${formatted}${spacer}${upperRouteName}`;
  if (Array.isArray(route.routes) && route.routes.length)
    return routeToTitle(route.routes, props, defaultTitle, formatted);
  return `${formatted}${spacer}${defaultTitle}`;
};

export default class DocumentTitle extends Component<DocumentTitleProps, DocumentTitleStates> {
  static defaultProps = {
    spacer: ' - ',
  };

  static getDerivedStateFromProps(nextProps: DocumentTitleProps, prevState: DocumentTitleStates) {
    const { pathname } = nextProps.location;
    if (typeof pathname !== 'string') return null;
    if (pathname === prevState.pathname) return null;
    const defaultTitle = formatMessage({
      id: nextProps.defaultTitle,
      defaultMessage: nextProps.defaultTitle || pathname,
    });
    try {
      document.title = routeToTitle(nextProps.route.routes, nextProps, defaultTitle);
    } catch {
      document.title = defaultTitle;
    }
    return { pathname };
  }

  state = {
    pathname: '/',
  };

  render() {
    return this.props.children;
  }
}
