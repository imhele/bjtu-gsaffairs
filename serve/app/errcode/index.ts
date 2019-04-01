export interface ErrorMessage {
  errcode: number;
  errmsg?: string;
  [key: string]: any;
  [key: number]: any;
}

export * from './validation';

export class BaseError extends Error {
  public type: string;
}

export class AuthorizeError extends BaseError {
  public type = 'AuthorizeError';
}

export class DataNotFound extends BaseError {
  public type = 'DataNotFound';
}

export class OperationIgnored extends BaseError {
  public type = 'OperationIgnored';
}

export class SystemClosed extends BaseError {
  public type = 'SystemClosed';
}

export class CreateFileFailed extends BaseError {
  public type = 'CreateFileFailed';
}

const Errcode: { [key: string]: ErrorMessage } = {
  SystemBusy: { errcode: -1, errmsg: '系统繁忙' },
  Success: { errcode: 0, errmsg: '请求成功' },
  ValidationError: { errcode: 30001, errmsg: '数据校验失败' },
  AuthorizeError: { errcode: 40001, errmsg: '权限校验失败' },
  DataNotFound: { errcode: 40002, errmsg: '数据不存在' },
  SystemClosed: { errcode: 40003, errmsg: '系统暂未开放' },
  OperationIgnored: { errcode: 40004, errmsg: '操作被忽略' },
  CreateFileFailed: { errcode: 40005, errmsg: '生成文件失败' },
};

export default Errcode;
