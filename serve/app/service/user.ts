import hash from 'hash.js';
import moment from 'moment';
import { Service } from 'egg';
import { DataNotFound } from '../errcode';
import { PostgraduateModel, StaffModel } from '../model';

export enum UserType {
  Postgraduate,
  Staff,
}

export type ScopeValue =
  | 'scope.admin'
  | 'scope.position.manage.list'
  | 'scope.position.manage.create'
  | 'scope.position.manage.export'
  | 'scope.position.manage.audit'
  | 'scope.position.manage.apply'
  | 'scope.position.teach.list'
  | 'scope.position.teach.create'
  | 'scope.position.teach.export'
  | 'scope.position.teach.audit'
  | 'scope.position.teach.apply';

/**
 * @Ref https://yuque.com/hele/doc/qzuay6#scopeList
 */
export const ScopeList = {
  admin: 'scope.admin',
  position: {
    manage: {
      list: 'scope.position.manage.list',
      create: 'scope.position.manage.create',
      export: 'scope.position.manage.export',
      audit: 'scope.position.manage.audit',
      apply: 'scope.position.manage.apply',
    },
    teach: {
      list: 'scope.position.teach.list',
      create: 'scope.position.teach.create',
      export: 'scope.position.teach.export',
      audit: 'scope.position.teach.audit',
      apply: 'scope.position.teach.apply',
    },
  },
};

// Basic scopes
export const UserScope: { [key: number]: ScopeValue[] } = {
  [UserType.Postgraduate]: [
    'scope.position.manage.list',
    'scope.position.manage.apply',
    'scope.position.teach.list',
    'scope.position.teach.apply',
  ],
  [UserType.Staff]: [
    'scope.position.manage.list',
    'scope.position.manage.create',
    'scope.position.teach.list',
    'scope.position.teach.create',
  ],
};

/**
 * Service of user
 */
export default class UserService extends Service {
  public getSign(
    loginname: string,
    password: string,
    timestamp: number | string = moment().unix(),
  ): string {
    return this.signPassword(`${timestamp}${loginname}`, password);
  }

  public getToken(
    loginname: string,
    password: string,
    timestamp: number | string = moment().unix(),
  ): string {
    return `${timestamp} ${loginname} ${this.getSign(loginname, password, timestamp)}`;
  }

  public async findOne(loginname: string) {
    const { model } = this.ctx;
    let type = UserType.Postgraduate;
    let user: any = await model.Client.Postgraduate.findByPk(loginname);
    if (user === null) {
      type = UserType.Staff;
      user = await model.Client.Staff.findByPrimary(loginname);
    }
    if (user === null) throw new DataNotFound('用户不存在');
    /**
     * @TODO Extra role of current user
     */
    const auditableDep = await this.isIntershipAdmin(loginname);
    const auditLink = 'audit_link' in user ? user.audit_link : [];
    const scope = UserScope[type];
    if (auditableDep.length || auditLink.length) {
      /* Scope of batch audit */
      scope.push(ScopeList.position.teach.audit as ScopeValue);
      scope.push(ScopeList.position.manage.audit as ScopeValue);
    }
    return {
      auditableDep,
      auditLink,
      user: user.format() as PostgraduateModel | StaffModel,
      scope,
      type,
    };
  }

  public async updateLastLogin(loginname: string, userType: UserType) {
    const { model } = this.ctx;
    const now = moment().local();
    await model.Client[UserType[userType]].update(
      { last_login: now.format('YYYY-MM-DD HH:mm:ss') },
      { fields: ['last_login'], where: { loginname } },
    );
  }

  private signPassword(content: string, secret: string): string {
    return hash
      .hmac(hash.sha256 as any, secret)
      .update(content)
      .digest('hex');
  }

  private async isIntershipAdmin(jobnum: string) {
    const { model } = this.ctx;
    const auditableDepartments = await model.Interships.Admins.findAll({
      where: { staff_jobnum: jobnum },
    });
    return auditableDepartments.map((dep: any) => dep.get('department_code') as string);
  }
}
