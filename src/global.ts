import { version } from 'antd';

// tslint:disable-next-line
console.log(`[VersionInfo] Ant Design ${version}`);

export const APIPrefix: string = '/api';

export const MediaQuery: string = '(max-width: 599px)';

export const enum AuthorizedId {
  BasicLayout,
}
