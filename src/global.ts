import { version } from 'antd';
import { formatMessage } from 'umi-plugin-locale';
import MemorableModal from '@/components/MemorableModal';

// tslint:disable-next-line
console.log(`[VersionInfo] Ant Design ${version}`);

export const APIPrefix: string = '/api';

export const MediaQuery: string = '(max-width: 599px)';

export const enum AuthorizedId {
  BasicLayout,
}

export const enum MemorableModalId {
  DeletePostion = '0',
}

MemorableModal.setLocale((time, unit) =>
  formatMessage(
    { id: 'tip.no-more-tip-in' },
    { time, unit: formatMessage({ id: `word.${unit}` }) },
  ),
);
