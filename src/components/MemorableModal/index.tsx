import React from 'react';
import { Checkbox, Modal } from 'antd';
import { ModalFuncProps } from 'antd/es/modal';
import { CheckboxChangeEvent } from 'antd/es/checkbox';

type MemorableModalFuncType = 'confirm' | 'error' | 'info' | 'success' | 'warn';

export type TimeUnit = 'day' | 'hour' | 'minute' | 'second';

export interface MemorableModalProps extends ModalFuncProps {
  defaultEnable?: boolean;
  expiresIn?: number;
  id: string | number;
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
  setStorage: (storage: Storage) => void;
}

const noop = () => {};

let storage = sessionStorage;

const checked: { [key: string]: boolean } = {};

let locale = (e: number, u: TimeUnit): React.ReactNode =>
  `No more reminders within ${e} ${u}${e === 1 ? '' : 's'}`;

const onChangeCheckbox = ({ target }: CheckboxChangeEvent) =>
  target.value && (checked[target.value] = target.checked);

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
  if (typeof id === 'string' || typeof id === 'number') {
    const formattedId = `MemorableModal-${type}-${id}`;
    const now = Date.now();
    const preExpiryTime = storage.getItem(formattedId);
    if (preExpiryTime && now.toString() < preExpiryTime) {
      onOk!(payload);
      return { destroy: null, update: null };
    }
    checked[formattedId] = defaultEnable || !!preExpiryTime || !optional;
    return Modal[type]({
      ...modalProps,
      content: optional ? (
        <React.Fragment>
          {content}
          <div>
            <Checkbox
              defaultChecked={checked[formattedId]}
              onChange={onChangeCheckbox}
              value={formattedId}
            >
              {formatText(expiresIn, timeUnit)}
            </Checkbox>
          </div>
        </React.Fragment>
      ) : (
        content
      ),
      onOk: (...args: any[]) => {
        if (checked[formattedId]) {
          const nextExpiryTime = expiresIn
            ? (now + tranformTime(expiresIn, timeUnit)).toString()
            : '9';
          storage.setItem(formattedId, nextExpiryTime);
        } else if (preExpiryTime) {
          storage.removeItem(formattedId);
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
  setStorage: newStorage => (storage = newStorage),
};

export default MemorableModal;
