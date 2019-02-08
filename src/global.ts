import React from 'react';
import { version } from 'antd';
import { formatMessage } from 'umi-plugin-locale';
import MemorableModal from '@/components/MemorableModal';

// tslint:disable-next-line
console.log(`[VersionInfo] Ant Design ${version}`);

export const APIPrefix: string = '/api';

export const enum GlobalId {
  BasicLayout,
  DeletePostion,
}

MemorableModal.setLocale((time, unit) =>
  formatMessage(
    { id: 'tip.no-more-tip-in' },
    { time, unit: formatMessage({ id: `word.${unit}` }) },
  ),
);
