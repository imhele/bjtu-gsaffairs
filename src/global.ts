import React from 'react';
import { version } from 'antd';
import { formatMessage } from 'umi-plugin-locale';
import MemorableModal from '@/components/MemorableModal';

// tslint:disable-next-line
console.log(`[VersionInfo] Ant Design ${version}`);

export const APIPrefix: string = '/api';

export const TypeSpaceChar: string = '~';

/**
 * Global id for components
 */
export const enum GlobalId {
  BasicLayout,
  DeletePostion,
  PromptAuditAllDone,
}

/**
 * Id for storage items.
 * `NT`: Novice tutorial
 */
export enum StorageId {
  /**
   * sessionStorage
   */
  PARowKes = 'Position/Audit-0',
  /**
   * localStorage
   */
  NTPLSelectAll = 'NT-Position/List-0',
}

MemorableModal.setLocale((time, unit) =>
  formatMessage(
    { id: 'tip.no-more-tip-in-time' },
    { time, unit: formatMessage({ id: `word.${unit}` }) },
  ),
);
