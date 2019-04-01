import fs from 'fs';
import path from 'path';
import lodash from 'lodash';
import { Controller } from 'egg';
import { CellAction } from '../link';
import HTML2PDF from '../utils/HTML2PDF';
import { Op, WhereOptions } from 'sequelize';
import { getFromIntEnum, parseJSON } from '../utils';
import { ScopeList, UserType } from '../service/user';
import { SchoolCensus as CensusModel } from '../model/school/census';
import { AuthorizeError, CreateFileFailed, DataNotFound } from '../errcode';
import { excludeFormFields, applyReturn, positionDetailFields } from './stuapply.json';
import {
  attr as PositionAttr,
  PositionType,
  Position as PositionModel,
} from '../model/interships/position';
import {
  ApplyAuditStatus,
  IntershipsStuapply as StuapplyModel,
  ApplyStatus,
} from '../model/interships/stuapply';

const ActionText = {
  [CellAction.Preview]: { text: '岗位', type: CellAction.Preview },
  [CellAction.Apply]: { text: '申请', type: CellAction.Apply },
  [CellAction.Audit]: { text: '审核', type: CellAction.Audit },
  [CellAction.Delete]: { text: '删除', type: CellAction.Delete },
  [CellAction.File]: { text: '下载协议书', type: CellAction.File },
  [CellAction.Edit]: { text: '编辑', type: CellAction.Edit },
};

export default class UserController extends Controller {
  public async list() {
    const { ctx, service } = this;
    const { auth, body } = ctx.request;
    const { type } = ctx.params as { type: keyof typeof PositionType };
    const positionType = getFromIntEnum(PositionAttr, 'types', null, PositionType[type]);
    if (positionType === -1) return;
    const { limit = 10, mode, offset = 0, student_number, status, audit } = body;

    /**
     * Qurey batabase
     */
    const options = { limit, offset };
    const applyFilters = [] as WhereOptions<StuapplyModel>[];
    const include: any = [
      { model: ctx.model.School.Census, where: {} },
      { model: ctx.model.Interships.Position, where: { types: positionType } },
    ];

    if (auth.type === UserType.Postgraduate)
      applyFilters.push({ student_number: auth.user.loginname });
    else {
      if (student_number) applyFilters.push({ student_number });
      if (body.student_name) include[0].where.name = body.student_name;
      if (body.position_name) include[1].where.name = { [Op.like]: `%${body.position_name}%` };
      if (!auth.scope.includes(ScopeList.admin)) {
        if (mode === '导师模式') {
          include[0].where[Op.or] = {
            teacher_code: auth.user.loginname,
            teacher2_code: auth.user.loginname,
          } as WhereOptions<CensusModel>;
        } else if (!auth.auditLink.length) {
          include[1].where[Op.or] = {
            staff_jobnum: auth.user.loginname,
            department_code: { [Op.or]: auth.auditableDep },
          } as WhereOptions<PositionModel>;
        }
      }
    }
    if (status && Object.keys(ApplyStatus).includes(status))
      applyFilters.push(ctx.model.Interships.Stuapply.formatBack({ status }));
    if (audit && ApplyAuditStatus.includes(audit))
      applyFilters.push(ctx.model.Interships.Stuapply.formatBack({ audit }));
    if (applyFilters.length) Object.assign(options, { where: applyFilters });
    const dbRes = await service.stuapply.findAndCountAll<false>(options, include, false);

    /**
     * Format dataSource
     */
    const dataSource = dbRes.positions.map(item => {
      const availableActions = service.stuapply.authorizeWithoutPrefix(item, auth, type);
      availableActions.delete(CellAction.Apply);
      const action: StandardTableActionProps = Array.from(availableActions.entries())
        .map(([actionItem, enable]) => ({ ...ActionText[actionItem], disabled: !enable }))
        .concat(ActionText[CellAction.Preview] as any);
      const title = `申请人：${item.SchoolCensus.name}\xa0\xa0\xa0\xa0申请岗位：${
        item.IntershipsPosition.name
      }\xa0\xa0\xa0\xa0当前状态：${item.IntershipsStuapply.status}`;
      return {
        ...item,
        action,
        title,
        key: item.IntershipsStuapply.id,
        positionKey: item.IntershipsPosition.id,
      };
    });

    /**
     * Construct result
     */
    const columns: any = {};
    const columnsObj = service.stuapply.getColumnsObj(false);
    Object.entries(columnsObj).forEach(([key, value]) => (columns[key] = Object.values(value)));
    columns.IntershipsPosition = positionDetailFields.map(k => columnsObj.IntershipsPosition[k]);
    const result: Partial<PositionState> = {
      columns,
      columnsKeys: Object.keys(columns),
      dataSource,
      columnsText: {
        IntershipsStuapply: '申请信息',
        SchoolCensus: '学籍信息',
        IntershipsPosition: '岗位信息',
      },
      total: dbRes.total,
    };

    ctx.response.body = result;
  }

  public async form() {
    const {
      ctx: { request, response, model, params },
      service,
    } = this;
    /* position id */
    const { type, id } = params as { type: keyof typeof PositionType; id: string };
    if (!Object.keys(PositionType).includes(type) || id === void 0) return;
    const positionId = parseInt(id, 10);
    const position = await service.position.findOne(parseInt(id, 10), type);
    let applyunable: boolean = true;
    if (request.auth.scope.includes(ScopeList.position[type].apply))
      applyunable = await service.stuapply.hasOnePassedApplication(request.auth.user.loginname);
    const availableAction = service.position.getPositionAction(
      position,
      request.auth,
      type,
      applyunable,
    );
    if (!availableAction.get(CellAction.Apply)) throw new AuthorizeError('你暂时无法申请此岗位');
    const hasApplied = await service.stuapply.hasApplied(positionId, request.auth.user.loginname);
    if (hasApplied) throw new AuthorizeError('你已经申请过这个岗位了，去找找其他岗位吧');

    const formItems = model.Interships.Stuapply.toForm(excludeFormFields as any, true);
    response.body = { formItems };
  }

  public async create() {
    const {
      ctx: { request, response, model, params },
      service,
    } = this;
    /* position id */
    const { type, id } = params as { type: keyof typeof PositionType; id: string };
    if (!Object.keys(PositionType).includes(type) || id === void 0) return;
    const positionId = parseInt(id, 10);
    const position = await service.position.findOne(parseInt(id, 10), type);
    let applyunable: boolean = true;
    if (request.auth.scope.includes(ScopeList.position[type].apply))
      applyunable = await service.stuapply.hasOnePassedApplication(request.auth.user.loginname);
    const availableAction = service.position.getPositionAction(
      position,
      request.auth,
      type,
      applyunable,
    );
    if (!availableAction.get(CellAction.Apply)) throw new AuthorizeError('你暂时无法申请此岗位');
    const hasApplied = await service.stuapply.hasApplied(positionId, request.auth.user.loginname);
    if (hasApplied) throw new AuthorizeError('你已经申请过这个岗位了，去找找其他岗位吧');

    const values = model.Interships.Stuapply.formatBack({
      ...request.body,
      position_id: position.id,
      student_number: request.auth.user.loginname,
      status: '待审核',
      audit: ApplyAuditStatus[1],
      audit_log: JSON.stringify([
        service.position.getAuditLogItem(request.auth, ApplyAuditStatus[0]),
      ]),
    } as StuapplyModel<true>);
    await service.stuapply.addOne(values as any);

    response.body = {
      ...applyReturn,
      stepsProps: {
        current: 1,
        steps: ApplyAuditStatus.map(title => ({ title })),
      },
      extra: {
        ...applyReturn.extra,
        dataSource: {
          name: position.name,
          phone: request.body.phone,
          work_time_l: position.work_time_l,
        },
      },
    };
  }

  public async delete() {
    const {
      ctx: { request, response, params },
      service,
    } = this;
    /* apply id */
    const { type, id } = params as { type: keyof typeof PositionType; id: string };
    if (!Object.keys(PositionType).includes(type) || id === void 0) return;
    const apply = await service.stuapply.findOne(parseInt(id, 10));
    if (
      apply.student_number !== request.auth.user.loginname &&
      !request.auth.scope.includes(ScopeList.admin)
    )
      throw new AuthorizeError('你暂时没有权限删除这条申请记录');

    await service.stuapply.deleteOne(parseInt(id, 10));
    response.body = { errmsg: '删除成功' };
  }

  public async edit() {
    const {
      ctx: { request, response, model, params },
      service,
    } = this;
    const { type, id } = params as { type: keyof typeof PositionType; id: string };
    if (!Object.keys(PositionType).includes(type) || id === void 0) return;
    const apply = await service.stuapply.findOne(parseInt(id, 10));
    const isAdmin = request.auth.scope.includes(ScopeList.admin);
    if (apply.student_number !== request.auth.user.loginname && !isAdmin)
      throw new AuthorizeError('你暂时没有权限编辑这条申请记录');

    delete request.body.id;
    if (!isAdmin) delete request.body.position_id;
    delete request.body.student_number;
    const values = model.Interships.Stuapply.formatBack({
      ...request.body,
      status: isAdmin ? apply.status : '待审核',
      audit: isAdmin ? apply.audit : ApplyAuditStatus[1],
      audit_log: JSON.stringify([
        ...parseJSON(apply.audit_log), // some bugs here
        service.position.getAuditLogItem(request.auth, '修改信息'),
      ]),
    } as StuapplyModel<true>);

    await service.stuapply.updateOne(parseInt(id, 10), values);
    response.body = { errmsg: '修改成功' };
  }

  public async audit() {
    const {
      ctx: { request, response, model, params },
      service,
    } = this;
    const { type, id } = params as { type: keyof typeof PositionType; id: string };
    if (!Object.keys(PositionType).includes(type) || id === void 0) return;
    const apply = await service.stuapply.findOne(parseInt(id, 10));
    const hasOnePassed = await service.stuapply.hasOnePassedApplication(apply.student_number!);
    if (hasOnePassed) {
      response.body = {
        errmsg: `学号为 ${apply.student_number} 的学生已成功申请过一个岗位，当前审核操作被忽略`,
      };
      return;
    }
    const availableActions = service.stuapply.authorize(apply, request.auth, type);
    if (!availableActions.get(CellAction.Audit))
      throw new AuthorizeError('你暂时没有权限审核这条申请记录');
    let values = { status: '待审核' } as StuapplyModel;
    let auditStatusIndex: number = ApplyAuditStatus.indexOf(apply.audit);
    switch (request.body.status) {
      case '审核通过':
        if (++auditStatusIndex === ApplyAuditStatus.length - 1) values.status = '审核通过';
        break;
      case '废除':
        values.status = '废除';
        break;
      case '退回':
        auditStatusIndex = 0;
        values.status = '草稿';
        break;
      default:
        throw new DataNotFound('无效的审核选项');
    }
    values.audit = ApplyAuditStatus[auditStatusIndex];
    const opinion = Array.isArray(request.body.opinion) ? request.body.opinion : [];
    values.audit_log = JSON.stringify([
      ...parseJSON(apply.audit_log),
      service.position.getAuditLogItem(request.auth, apply.audit, request.body.status, ...opinion),
    ]);
    values = model.Interships.Stuapply.formatBack(values);
    await service.stuapply.updateOne(parseInt(id, 10), values as any);
    response.body = { errmsg: '审核成功' };
  }

  public async file() {
    const {
      ctx: { request, response, params },
      service,
    } = this;
    const { type, id } = params as { type: keyof typeof PositionType; id: string };
    if (!Object.keys(PositionType).includes(type) || id === void 0) return;
    const apply = await service.stuapply.findOne(parseInt(id, 10), true);
    if (apply.IntershipsStuapply.audit !== '申请成功')
      throw new AuthorizeError('申请成功后才能下载岗位协议书');
    const availableActions = service.stuapply.authorizeWithoutPrefix(apply, request.auth, type);
    if (!availableActions.get(CellAction.File))
      throw new AuthorizeError('你暂时没有权限下载岗位协议书');

    lodash.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
    const templatePath = path.join(__dirname, './applyTemplate.html');
    const compiled = lodash.template(fs.readFileSync(templatePath, 'utf8'));
    const template = compiled({
      ...apply,
      ...(await service.stuapply.getTeacherAndDep(apply)),
    });
    try {
      this.ctx.attachment('agreement.pdf');
      this.ctx.set('Content-Type', 'application/octet-stream');
      response.body = HTML2PDF(template);
    } catch {
      throw new CreateFileFailed();
    }
  }
}
