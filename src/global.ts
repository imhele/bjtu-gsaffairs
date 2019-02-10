import React from 'react';
import { version } from 'antd';
import { formatMessage } from 'umi-plugin-locale';
import MemorableModal from '@/components/MemorableModal';

// tslint:disable-next-line
console.log(`[VersionInfo] Ant Design ${version}`);

export const APIPrefix: string = '/api';

export const TypeSpaceChar: string = '~';

export const enum GlobalId {
  BasicLayout,
  DeletePostion,
  PromptAuditAllDone,
}

export const enum SessionStorageId {
  PositionAuditRowKes = '0',
}

MemorableModal.setLocale((time, unit) =>
  formatMessage(
    { id: 'tip.no-more-tip-in-time' },
    { time, unit: formatMessage({ id: `word.${unit}` }) },
  ),
);
