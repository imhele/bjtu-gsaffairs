import { Controller } from 'egg';
import { ScopeList } from '../service/user';
import { AuthorizeError } from '../errcode';
import { CellAction, SimpleFormItemType } from '../link';

export default class AdminController extends Controller {
  public async clientList() {
    const { ctx } = this;
    const { type } = ctx.params;
    const { scope } = ctx.request.auth;
    const { offset = 0, limit = 10 } = ctx.request.body;
    if (!type) return;
    if (!scope.includes(ScopeList.admin)) throw new AuthorizeError();
    const model = type === 'staff' ? ctx.model.Client.Staff : ctx.model.Client.Postgraduate;
    const dbRes = await model.findAndCountAll({
      attributes: ['loginname', 'username', 'audit_link'],
      offset,
      limit,
    });
    ctx.response.body = {
      rowKey: 'loginname',
      columns: [
        { dataIndex: 'loginname', title: '学号' },
        { dataIndex: 'username', title: '姓名' },
        { dataIndex: 'audit_link', title: '权限' },
        { dataIndex: 'action', title: '操作' },
      ],
      dataSource: dbRes.rows.map((item: any) => ({
        ...item.get(),
        action: {
          text: '删除',
          type: CellAction.Delete,
        },
      })),
      total: dbRes.count,
      form: [
        {
          id: 'loginname',
          title: '学号',
          type: SimpleFormItemType.Input,
          decoratorOptions: { rules: [{ required: true, message: '必填项' }] },
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
            { value: 'admin', title: '管理员权限' },
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
    const { loginname, username } = ctx.request.body;
    let auditLink = Array.isArray(ctx.request.body.audit_link) ? ctx.request.body.audit_link : [];
    if (auditLink.includes(ScopeList.admin)) auditLink = 'admin';
    if (!scope.includes(ScopeList.admin)) throw new AuthorizeError();
    const model = type === 'staff' ? ctx.model.Client.Staff : ctx.model.Client.Postgraduate;
    await model.create({
      loginname,
      username,
      is_active: 1,
      last_login: null as any,
      password: loginname,
      audit_link: JSON.stringify(auditLink),
    });
    ctx.response.body = { errmsg: '创建成功，初始密码与账号相同' };
  }
}
