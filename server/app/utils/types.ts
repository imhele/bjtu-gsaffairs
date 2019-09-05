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
  DepadminAudit = 1 << 4,
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

export const enum PostMeta {
  PLACE_HOLDER,
  /** 校本部 */
  MainCampus = 1 << 0,
  /** 东校区 */
  EastCampus = 1 << 1,
  /** 助管 */
  ManagementAssistant = 1 << 2,
  /** 助教 */
  TeachingAssistant = 1 << 3,
  /** 固定聘用 */
  RegularWork = 1 << 4,
  /** 临时聘用 */
  TemporaryWork = 1 << 5,
}

export const enum PostStatus {
  /** 草稿 */
  Draft,
  /** 待人事处审核 */
  WaitingHR,
  /** 待用人单位审核 */
  WaitingDepadmin,
  /** 待教务处审核 */
  WaitingDean,
  /** 待研究生院审核 */
  WaitingGraduateSchool,
  /** 待研工部审核 */
  WaitingPostgraduateWorkDep,
  /** 已发布 */
  Published,
  /** 无效岗位 */
  Invalid,
  /** 已删除 */
  Deleted,
}

export class Semester {
  static toOffset(date: Date) {
    return date.getFullYear() * 2 + Math.floor(date.getMonth() / 6);
  }

  static fromOffset(offset: number) {
    return new Date(`${Math.floor(offset / 2)}-${offset % 2 ? '07' : '01'}-01`);
  }

  date: Date;
  offset: number;

  constructor(from: Date | number) {
    if (typeof from === 'number') {
      this.offset = from;
      this.date = Semester.fromOffset(from);
    } else if (from instanceof Date) {
      this.date = from;
      this.offset = Semester.toOffset(this.date);
    } else {
      throw new Error('value must be a Date or a number');
    }
  }

  toString() {
    const year = this.date.getFullYear();
    const isSecondary = this.offset % 2 ? '二' : '一';
    return `${year}-${year + 1}学年 第${isSecondary}学期`;
  }
}
