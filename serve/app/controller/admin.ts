import { Controller } from 'egg';
import { parseJSON } from '../utils';
import { ScopeList } from '../service/user';
import { AuthorizeError } from '../errcode';
import { Op, WhereOptions } from 'sequelize';
import { filtersMap } from './positionFilter';
import { CellAction, SimpleFormItemType } from '../link';
import { Staff as StaffModel } from '../model/client/staff';
import { Postgraduate as PostgraduateModel } from '../model/client/postgraduate';

export default class AdminController extends Controller {
  public async clientList() {
    const { ctx } = this;
    const { scope } = ctx.request.auth;
    const { search, type } = ctx.params;
    const { offset = 0, limit = 10 } = ctx.request.body;
    if (!type) return;
    if (!scope.includes(ScopeList.admin)) throw new AuthorizeError();
    const loginnameText = type === 'staff' ? '工号' : '学号';
    const model = type === 'staff' ? ctx.model.Client.Staff : ctx.model.Client.Postgraduate;
    const where: any = {};
    if (search) {
      const searchQuery = { [Op.like]: `%${search}%` };
      where[Op.or] = {
        loginname: searchQuery,
        username: searchQuery,
        audit_link: searchQuery,
      } as WhereOptions<StaffModel & PostgraduateModel>;
    }
    const dbRes = await model.findAndCountAll({
      attributes: ['loginname', 'password', 'username', 'audit_link'],
      offset,
      limit,
      where,
    });
    ctx.response.body = {
      rowKey: 'loginname',
      columns: [
        { dataIndex: 'loginname', title: loginnameText },
        { dataIndex: 'username', title: '姓名' },
        { dataIndex: 'password', title: '密码' },
        { dataIndex: 'audit_link', title: '权限' },
        { dataIndex: 'action', title: '操作' },
      ],
      dataSource: dbRes.rows.map((item: any) => ({
        ...item.get(),
        audit_link: parseJSON(item.get('audit_link')) || [],
        action: [
          {
            text: '修改',
            type: CellAction.Edit,
          },
          {
            text: '删除',
            type: CellAction.Delete,
          },
        ],
      })),
      total: dbRes.count,
      form: [
        {
          id: 'loginname',
          title: loginnameText,
          type: SimpleFormItemType.Input,
          decoratorOptions: { rules: [{ required: true, message: '必填项' }] },
        },
        {
          id: 'password',
          title: '密码',
          type: SimpleFormItemType.Input,
          itemProps: { placeholder: `默认密码为与${loginnameText}相同` },
        },
        {
          id: 'username',
          title: '姓名',
          type: SimpleFormItemType.Input,
          decoratorOptions: { rules: [{ required: true, message: '必填项' }] },
        },
        {
          id: 'audit_link',
          title: '权限',
          type: SimpleFormItemType.Select,
          itemProps: { mode: 'multiple' },
          selectOptions: [
            { value: '研工部审核' },
            { value: '研究生院审核' },
            { value: '教务处审核' },
            { value: '人事处审核' },
            { value: 'admin', title: '超级管理员' },
          ],
        },
      ],
    };
  }

  public async clientDelete() {
    const { ctx } = this;
    const { id, type } = ctx.params;
    const { scope } = ctx.request.auth;
    if (!id || !type) return;
    if (!scope.includes(ScopeList.admin)) throw new AuthorizeError();
    const model = type === 'staff' ? ctx.model.Client.Staff : ctx.model.Client.Postgraduate;
    await model.destroy({ where: { loginname: id } });
    ctx.response.body = { errmsg: '删除成功' };
  }

  public async clientCreate() {
    const { ctx } = this;
    const { type } = ctx.params;
    const { scope } = ctx.request.auth;
    if (!type) return;
    const { loginname, password, username } = ctx.request.body;
    const auditLink = Array.isArray(ctx.request.body.audit_link) ? ctx.request.body.audit_link : [];
    if (!scope.includes(ScopeList.admin)) throw new AuthorizeError();
    const model = type === 'staff' ? ctx.model.Client.Staff : ctx.model.Client.Postgraduate;
    await model.create({
      loginname,
      username,
      is_active: 1,
      last_login: null as any,
      password: password || loginname,
      audit_link: JSON.stringify(auditLink),
    });
    ctx.response.body = { errmsg: `创建成功，密码为 ${password || loginname}` };
  }

  public async clientEdit() {
    const { ctx } = this;
    const { id, type } = ctx.params;
    const { scope } = ctx.request.auth;
    if (!id || !type) return;
    const { password, username, audit_link } = ctx.request.body;
    if (!scope.includes(ScopeList.admin)) throw new AuthorizeError();
    const model = type === 'staff' ? ctx.model.Client.Staff : ctx.model.Client.Postgraduate;
    const updateFields = { username, password: password || id };
    if (Array.isArray(audit_link))
      Object.assign(updateFields, { audit_link: JSON.stringify(audit_link) });
    await model.update(updateFields, { where: { loginname: id } });
    ctx.response.body = { errmsg: '修改成功' };
  }

  public async depAdminList() {
    const { ctx } = this;
    const { scope } = ctx.request.auth;
    const { offset = 0, limit = 10 } = ctx.request.body;
    if (!scope.includes(ScopeList.admin)) throw new AuthorizeError();
    const dbRes = await ctx.model.Interships.Admins.findAndCountAll({
      include: [
        { model: ctx.model.People.Staff, attributes: ['name'] },
        { model: ctx.model.Dicts.Department, attributes: ['name'] },
      ],
      offset,
      limit,
    });
    ctx.response.body = {
      rowKey: 'id',
      columns: [
        { dataIndex: 'staff_jobnum', title: '工号' },
        { dataIndex: 'staff_name', title: '姓名' },
        { dataIndex: 'department_name', title: '负责部门' },
        { dataIndex: 'action', title: '操作' },
      ],
      dataSource: dbRes.rows.map((item: any) => ({
        ...item.get(),
        staff_name: item.get().PeopleStaff.get('name'),
        department_name: item.get().DictsDepartment.get('name'),
        action: {
          text: '删除',
          type: CellAction.Delete,
        },
      })),
      total: dbRes.count,
      form: [
        {
          id: 'staff_jobnum',
          title: '工号',
          type: SimpleFormItemType.Input,
          decoratorOptions: { rules: [{ required: true, message: '必填项' }] },
        },
        {
          ...filtersMap.department_code,
          title: '管理单位',
          decoratorOptions: { rules: [{ required: true, message: '必填项' }] },
        },
      ],
    };
  }

  public async depAdminCreate() {
    const { ctx } = this;
    const { scope } = ctx.request.auth;
    const { staff_jobnum, department_code } = ctx.request.body;
    if (!scope.includes(ScopeList.admin)) throw new AuthorizeError();
    await ctx.model.Interships.Admins.create({ staff_jobnum, department_code });
    ctx.response.body = { errmsg: '创建成功' };
  }

  public async depAdminDelete() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { scope } = ctx.request.auth;
    if (!id) return;
    if (!scope.includes(ScopeList.admin)) throw new AuthorizeError();
    await ctx.model.Interships.Admins.destroy({ where: { id: parseInt(id, 10) } });
    ctx.response.body = { errmsg: '删除成功' };
  }

  public async timeConfig() {
    const { ctx } = this;
    const { scope } = ctx.request.auth;
    if (!scope.includes(ScopeList.admin)) throw new AuthorizeError();
    const { action } = ctx.params;
    switch (action) {
      case CellAction.Preview:
        const config: any = await ctx.model.Interships.Config.findOne();
        ctx.response.body = config === null ? { errcode: 0 } : config.get();
        break;
      case CellAction.Edit:
        const id = ctx.request.body.id;
        const semesters = JSON.parse(ctx.request.body.available_semesters || 'null');
        delete ctx.request.body.id;
        await ctx.model.Interships.Config.update(ctx.request.body, { where: { id } });
        if (semesters) {
          filtersMap.semester!.selectOptions = semesters.map((value: string) => ({ value }));
        }
        ctx.response.body = { errmsg: '修改成功' };
        break;
      default:
        return;
    }
  }
}
