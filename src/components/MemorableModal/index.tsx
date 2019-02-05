import React from 'react';
import { Modal, Switch } from 'antd';
import { ModalFuncProps } from 'antd/es/modal';

type MemorableModalFuncType = 'confirm' | 'error' | 'info' | 'success' | 'warn';

export type TimeUnit = 'day' | 'hour' | 'minute' | 'second';

export interface MemorableModalProps extends ModalFuncProps {
  defaultEnable?: boolean;
  expiresIn?: number;
  id: string;
  onOk?: (payload: any, ...args: any[]) => any | PromiseLike<any>;
  optional?: boolean;
  payload?: any;
  timeUnit?: TimeUnit;
  formatText?: (expiresIn?: number, timeUnit?: TimeUnit) => React.ReactNode;
}

export type MemorableModalFunc = (
  props: MemorableModalProps,
) => {
  destroy: () => void;
  update: (newConfig: ModalFuncProps) => void;
};

interface MemorableModalComponent {
  confirm: MemorableModalFunc;
  error: MemorableModalFunc;
  info: MemorableModalFunc;
  success: MemorableModalFunc;
  warn: MemorableModalFunc;
  setLocale: (formatText: (expiresIn?: number, timeUnit?: TimeUnit) => React.ReactNode) => void;
}

const noop = () => {};

const selected: { [key: string]: boolean } = {};

let locale = (e: number, u: TimeUnit): React.ReactNode =>
  `No more reminders within ${e} ${u}${e === 1 ? '' : 's'}`;

const onChangeSelect = (checked: boolean, event: any) => {
  const { id = null } = event.currentTarget.dataset || {};
  if (!id) return false;
  selected[id] = checked;
};

const tranformTime = (pre: number, unit: TimeUnit): number => {
  switch (unit) {
    case 'second':
      return pre * 1000;
    case 'minute':
      return pre * 60 * 1000;
    case 'hour':
      return pre * 60 * 60 * 1000;
    case 'day':
      return pre * 24 * 60 * 60 * 1000;
    default:
      return pre;
  }
};

const Memorable = (
  {
    content,
    defaultEnable = true,
    expiresIn = 1,
    id,
    onOk = noop,
    optional = true,
    payload,
    timeUnit = 'minute',
    formatText = locale,
    ...modalProps
  }: MemorableModalProps,
  type: MemorableModalFuncType,
) => {
  if (typeof id === 'string') {
    id = `MemorableModal-${type}-${id}`;
    const now = Date.now();
    const preExpiryTime = localStorage.getItem(id);
    if (preExpiryTime && now.toString() < preExpiryTime) {
      onOk!(payload);
      return { destroy: null, update: null };
    }
    selected[id] = defaultEnable || !!preExpiryTime || !optional;
    return Modal[type]({
      ...modalProps,
      content: optional ? (
        <React.Fragment>
          {content}
          <div>
            <Switch
              data-id={id}
              defaultChecked={selected[id]}
              onChange={onChangeSelect as any}
              size="small"
              style={{ marginRight: 8 }}
            />
            {formatText(expiresIn, timeUnit)}
          </div>
        </React.Fragment>
      ) : (
        content
      ),
      onOk: (...args: any[]) => {
        if (selected[id]) {
          const nextExpiryTime = expiresIn
            ? (now + tranformTime(expiresIn, timeUnit)).toString()
            : '9';
          localStorage.setItem(id, nextExpiryTime);
        } else if (preExpiryTime) {
          localStorage.removeItem(id);
        }
        return onOk!(payload, ...args);
      },
    });
  }
  return Modal[type](modalProps);
};

const MemorableModal: MemorableModalComponent = {
  confirm: props => Memorable(props, 'confirm'),
  error: props => Memorable(props, 'error'),
  info: props => Memorable(props, 'info'),
  success: props => Memorable(props, 'success'),
  warn: props => Memorable(props, 'warn'),
  setLocale: formatText => (locale = formatText),
};

export default MemorableModal;
