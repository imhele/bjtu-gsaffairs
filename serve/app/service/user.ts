import MD5 from 'md5.js';
import hash from 'hash.js';
import moment from 'moment';
import { Service } from 'egg';
import { parseJSON } from '../utils';
import { DataNotFound } from '../errcode';
import { Staff as StaffModel } from '../model/client/staff';
import { Postgraduate as PostgraduateModel } from '../model/client/postgraduate';

export enum UserType {
  Postgraduate,
  Staff,
}

export type ScopeValue =
  | 'scope.admin'
  | 'scope.position.manage.list'
  | 'scope.position.manage.create'
  | 'scope.position.manage.edit'
  | 'scope.position.manage.export'
  | 'scope.position.manage.audit'
  | 'scope.position.manage.audit-pass'
  | 'scope.position.manage.apply'
  | 'scope.position.teach.list'
  | 'scope.position.teach.create'
  | 'scope.position.teach.edit'
  | 'scope.position.teach.export'
  | 'scope.position.teach.audit'
  | 'scope.position.teach.audit-pass'
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
      auditPass: 'scope.position.manage.audit-pass',
      apply: 'scope.position.manage.apply',
    },
    teach: {
      list: 'scope.position.teach.list',
      create: 'scope.position.teach.create',
      edit: 'scope.position.teach.edit',
      export: 'scope.position.teach.export',
      audit: 'scope.position.teach.audit',
      auditPass: 'scope.position.teach.audit-pass',
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
    'scope.position.manage.edit',
    'scope.position.teach.list',
    'scope.position.teach.create',
    'scope.position.teach.edit',
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

  public getMd5(loginname: string, timestamp: string) {
    const { secretKey } = this.config;
    return new MD5().update(`${loginname}${timestamp}${secretKey}`).digest('hex');
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
      user = await model.Client.Staff.findByPk(loginname);
    }
    if (user === null) throw new DataNotFound('用户不存在');
    let scope = [...UserScope[type]];
    let auditLink: string[] = parseJSON(user.audit_link);
    const auditableDep = await this.isIntershipAdmin(loginname);
    if (!Array.isArray(auditLink)) auditLink = [];
    if (auditLink.includes('admin') || auditLink.includes('研工部审核')) {
      scope = ['scope.admin'];
      auditLink = [];
    } else {
      if (auditableDep.length || auditLink.length) {
        /* Scope of audit */
        scope.push(
          ScopeList.position.teach.audit as ScopeValue,
          ScopeList.position.teach.auditPass as ScopeValue,
          ScopeList.position.manage.audit as ScopeValue,
          ScopeList.position.manage.auditPass as ScopeValue,
        );
      } else {
        const { manage } = ScopeList.position;
        scope = scope.filter(i => ![manage.create, manage.list].includes(i));
      }
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
