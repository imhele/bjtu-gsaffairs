import { version } from 'antd';

// tslint:disable-next-line
console.log(`[VersionInfo] Ant Design ${version}`);

export const dva = {
  config: {
    onError(err: ErrorEvent) {
      err.preventDefault();
      console.error(err.message);
    },
  },
};
