import { YamlJoiSchema } from 'yaml-joi';
import { DefineAttributeColumnOptions } from 'sequelize';

export type PowerPartial<T> = { [U in keyof T]?: T[U] extends object ? PowerPartial<T[U]> : T[U] };

export type PowerRequired<T> = {
  [U in keyof T]-?: T[U] extends object ? PowerRequired<T[U]> : T[U];
};

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type ArgsType<T extends (...a: any) => any> = T extends (...a: infer R) => any ? R : any;

export type ArgsOrArg0<T extends (...a: any) => any> = ArgsType<T> extends [ArgsType<T>[0]]
  ? (ArgsType<T> | ArgsType<T>[0])
  : ArgsType<T>;

export type Include<T, U> = T extends U ? T : never;

export type DefineModelAttr<T> = { [P in keyof T]: DefineAttributeColumnOptions };

export type DefineModel<T> = {
  Attr: DefineModelAttr<T>;
  Sample: T;
  Validator: YamlJoiSchema;
};

export const enum Env {
  Production,
  Dev,
  Test,
}

export const enum AccountScope {
  PLACE_HOLDER,
  /**
   * 管理员身份
   */
  Admin = 1 << 0,
  /**
   * 研究生身份
   */
  Postgraduate = 1 << 1,
  /**
   * 职工身份
   */
  Staff = 1 << 2,
  /**
   * 人事处审核权限
   */
  HRAudit = 1 << 3,
  /**
   * 用人单位审核权限
   */
  EmployerAudit = 1 << 4,
  /**
   * 教务处审核权限
   */
  DeanAudit = 1 << 5,
  /**
   * 研究生院审核权限
   */
  GraduateSchoolAudit = 1 << 6,
  /**
   * 研工部审核权限
   */
  PostgraduateWorkDepAudit = 1 << 7,
}

export const enum Gender {
  Male,
  Female,
}

export const enum StudentType {
  PLACE_HOLDER,
  /** 博士 */
  Doctor,
  /** 硕士 */
  Master,
  /** 推免生 */
  Exempted,
  /** 进修生 */
  Advanced,
}
