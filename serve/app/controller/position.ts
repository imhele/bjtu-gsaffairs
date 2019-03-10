import { Controller } from 'egg';
import { ScopeList, UserType } from '../service/user';
import { Op, WhereOptions } from 'sequelize';
import { AuthResult } from '../extend/request';
import { getFromIntEnum, parseJSON } from '../utils';
import { AuthorizeError, DataNotFound } from '../errcode';
// import { StepsProps } from '../../../src/components/Steps';
// import { PositionState } from '../../../src/models/connect';
import { attr as TaskTeachingAttr } from '../model/task/teaching';
import { CellAction, SimpleFormItemType, TopbarAction } from '../link';
// import { FetchListBody, FetchFormBody } from '../../../src/api/position';
import { filtersKeyMap, filtersMap, getFilters } from './positionFilter';
// import { StandardTableActionProps } from '../../../src/components/StandardTable';
// import { SimpleFormItemProps } from '../../../src/components/SimpleForm';
import {
  Position as PositionModel,
  attr as PositionAttr,
  PositionAuditStatus,
  PositionStatus,
  PositionType,
} from '../model/interships/position';
import {
  auditFormItems,
  createReturn,
  detailColumns,
  formLayoutProps,
  operationArea,
  positionFormFields,
  tableColumns,
  tableQueryFields,
  teachingTaskFields,
} from './position.json';

export const ActionText = {
  [CellAction.Apply]: '申请',
  [CellAction.Audit]: '审核',
  [CellAction.Delete]: '删除',
  [CellAction.Download]: '下载', // uncompleted function
  [CellAction.Edit]: '编辑',
  [CellAction.Preview]: '预览',
};

export default class PositionController extends Controller {
  public async list() {
    const { ctx, service } = this;
    const { auth } = ctx.request;
    const body = ctx.request.body as FetchListBody;
    const { type } = ctx.params as { type: keyof typeof PositionType };
    const positionType = getFromIntEnum(PositionAttr, 'types', null, PositionType[type]);
    const { limit = 10, offset = 0 } = body;
    if (positionType === -1) return;

    let columns = [...tableColumns];
    let filtersKey = filtersKeyMap[type].withStatus;
    if (auth.type === UserType.Postgraduate)
      columns = columns.filter(({ dataIndex }) => !['audit', 'status'].includes(dataIndex));

    /**
     * Construct `filtersValue`
     */
    let attributes = tableQueryFields;
    const isAdmin = auth.scope.some(i => i === ScopeList.admin);
    const hasAuditScope = isAdmin || auth.scope.some(i => i === ScopeList.position[type].audit);
    const filters: WhereOptions<PositionModel>[] = [{ ...body.filtersValue }];
    filters[0].types = positionType;
    Object.keys(filters[0]).forEach(key => {
      /* Input 类型使用模糊查询 */
      if (filtersMap[key] && filtersMap[key].type === SimpleFormItemType.Input)
        filters[0][key] = { [Op.like]: `%${filters[0][key]}%` };
    });
    if (!hasAuditScope) {
      if (auth.scope.includes(ScopeList.position[type].create)) {
        /* 没有审核权限的用户只能检索到已发布的岗位或自己创建的岗位 */
        filters.push({
          [Op.or]: [
            { status: ctx.model.Interships.Position.formatBack({ status: '已发布' }).status },
            { staff_jobnum: auth.user.loginname },
          ],
        });
      } else {
        /* 既没有审核权限，也没有创建权限 */
        attributes = tableQueryFields;
        filtersKey = filtersKeyMap[type].withoutStatus;
        columns = columns.filter(i => i.dataIndex !== 'status');
        filters[0].status = ctx.model.Interships.Position.formatBack({ status: '已发布' }).status;
      }
    } else if (!auth.auditLink.length && !isAdmin) {
      /* 部门管理员只能看到自己单位的岗位 */
      filters.push({
        [Op.or]: [
          { department_code: { [Op.or]: auth.auditableDep } },
          { staff_jobnum: auth.user.loginname },
        ],
      });
    }

    /**
     * Qurey batabase
     */
    const { positions, total } = await service.position.findSomeWithDep({
      limit,
      offset,
      attributes,
      count: true,
      where: { [Op.and]: filters },
      depAttributes: ['name'],
    });

    /**
     * Format dataSource
     */
    const dataSource = positions.map(item => {
      const availableActions = service.position.getPositionAction(item, auth, type);
      availableActions.delete(CellAction.Preview);
      const action: StandardTableActionProps = Array.from(availableActions.entries())
        .filter(([_, enable]) => enable)
        .map(([actionItem]) => ({
          text: ActionText[actionItem],
          type: actionItem,
        }));
      return {
        ...item,
        name: {
          type: CellAction.Preview,
          text: item.name,
        } as StandardTableActionProps,
        action: action.length ? action : '--',
      };
    });

    /**
     * Construct result
     */
    const result: Partial<PositionState> = {
      columns,
      dataSource,
      total,
      rowKey: 'id',
      operationArea,
      filters: getFilters(filtersKey),
      actionKey: ['action', 'name'],
      selectable: hasAuditScope && { columnWidth: 57 },
    };

    ctx.response.body = result;
  }

  public async detail() {
    const { ctx, service } = this;
    const { auth } = ctx.request;
    const { type, id } = ctx.params as { type: keyof typeof PositionType; id: string };
    if (!Object.keys(PositionType).includes(type) || id === void 0) return;

    let columnsKey: string[] = [...detailColumns.withoutAuditLog];
    const position = await service.position.findOne(parseInt(id, 10), type, type === 'teach');
    position.audit_log = service.position.formatAuditLog(position.audit_log);

    /**
     * Construct `stepsProps`.
     */
    const stepsProps: StepsProps = {
      labelPlacement: 'vertical',
      steps: [],
    };

    /**
     * Authorize
     */
    const availableActions = service.position.getPositionAction(position, auth, type);
    if (!availableActions.get(CellAction.Preview))
      throw new AuthorizeError('你暂时没有权限查看这个岗位的信息');
    if (availableActions.has(CellAction.Audit) || availableActions.has(CellAction.Edit)) {
      columnsKey = [...detailColumns.withAuditLog];
      stepsProps.current = PositionAuditStatus[type].indexOf(position.audit!);
      stepsProps.status = PositionStatus[position.status!];
      stepsProps.steps = PositionAuditStatus[type]
        .filter(i => i !== '教务处审核')
        .map(i => ({ title: i === '研究生院审核' ? '教务处/研究生院审核' : i }));
      if (type === 'teach' && stepsProps.current > 2) stepsProps.current = stepsProps.current - 1;
    }
    if (type === 'teach') columnsKey.push(...teachingTaskFields);

    /**
     * Construct `columns`.
     */
    const columnsObj = service.position.getColumnsObj();
    columnsObj.staff_name.title = '负责人姓名';
    Object.assign(columnsObj.audit_log, { sm: 24, md: 24 });
    const columns = columnsKey
      .map(col => columnsObj[col])
      .filter(col => position[col.dataIndex] !== null);

    /**
     * Filter out other data in `position`.
     */
    const dataSource: { [K in keyof PositionModel]?: string } = {};
    columns.forEach(col => (dataSource[col.dataIndex] = position[col.dataIndex]));

    ctx.response.body = { columns, dataSource, stepsProps };
  }

  public async create() {
    const { ctx, service } = this;
    const { auth } = ctx.request;
    const { type } = ctx.params as { type: keyof typeof PositionType };
    if (!Object.keys(PositionType).includes(type)) return;

    /**
     * Authorize
     */
    if (
      !auth.scope.includes(ScopeList.position[type].create) &&
      !auth.scope.includes(ScopeList.admin)
    )
      throw new AuthorizeError('你暂时没有权限创建岗位');

    if (type === 'teach') {
      const hasCreated = await service.teaching.hasCreatedPosition(
        ctx.request.body.task_teaching_id,
      );
      if (hasCreated) throw new AuthorizeError('此课程已申请过岗位');
      ctx.request.body.name = await service.teaching.getTeachingTaskName(
        ctx.request.body.task_teaching_id,
      );
    }

    const values = ctx.model.Interships.Position.formatBack({
      ...ctx.request.body,
      audit: PositionAuditStatus[type][1],
      staff_jobnum: auth.user.loginname,
      status: '待审核',
      types: PositionType[type],
      audit_log: JSON.stringify([
        service.position.getAuditLogItem(auth, PositionAuditStatus[type][0]),
      ]),
    });
    if (values.department_code === void 0 || !auth.scope.includes(ScopeList.position[type].audit)) {
      const dep: any = await ctx.model.People.Staff.findByPk(auth.user.loginname, {
        attributes: ['department_code'],
      });
      if (dep !== null && dep.get('department_code') !== null)
        values.department_code = dep.get('department_code');
    }
    await service.position.addOne(values as any);

    /**
     * Construct `stepsProps`.
     */
    const stepsProps: StepsProps = {
      current: 1,
      steps: PositionAuditStatus[type]
        .filter(i => i !== '教务处审核')
        .map(i => ({ title: i === '研究生院审核' ? '教务处/研究生院审核' : i })),
    };

    ctx.response.body = {
      ...createReturn,
      stepsProps,
      extra: {
        ...createReturn.extra,
        dataSource: {
          name: ctx.request.body.name,
          need_num: ctx.request.body.need_num,
          work_time_l: ctx.request.body.work_time_l,
        },
      },
    };
  }

  public async delete() {
    const { ctx, service } = this;
    const { auth } = ctx.request;
    const { type, id } = ctx.params as { type: keyof typeof PositionType; id: string };
    if (!Object.keys(PositionType).includes(type) || id === void 0) return;

    /**
     * Authorize
     */
    const position = await service.position.findOne(parseInt(id, 10), type);
    const availableActions = service.position.getPositionAction(position, auth, type);
    if (!availableActions.get(CellAction.Delete))
      throw new AuthorizeError('你暂时没有权限删除这个岗位');

    await service.position.deleteOne(parseInt(id, 10));
    ctx.response.body = { errmsg: '删除成功' };
  }

  public async edit() {
    const { ctx, service } = this;
    const { auth } = ctx.request;
    const { type, id } = ctx.params as { type: keyof typeof PositionType; id: string };
    if (!Object.keys(PositionType).includes(type) || id === void 0) return;

    /**
     * Authorize
     */
    const position = await service.position.findOne(parseInt(id, 10), type);
    const availableActions = service.position.getPositionAction(position, auth, type);
    if (!availableActions.get(CellAction.Edit))
      throw new AuthorizeError('你暂时没有权限编辑这个岗位');

    delete ctx.request.body.id;
    delete ctx.request.body.name;
    delete ctx.request.body.types;
    delete ctx.request.body.staff_jobnum;
    const values = ctx.model.Interships.Position.formatBack({
      ...ctx.request.body,
      audit: PositionAuditStatus[type][1],
      status: '待审核',
      audit_log: JSON.stringify([
        ...parseJSON(position.audit_log),
        service.position.getAuditLogItem(auth, PositionAuditStatus[type][0]),
      ]),
    });
    await service.position.updateOne(parseInt(id, 10), values);
    ctx.response.body = { errmsg: '提交成功' };
  }

  public async audit() {
    const { ctx, service } = this;
    const { auth } = ctx.request;
    const { type, id } = ctx.params as { type: keyof typeof PositionType; id: string };
    if (!Object.keys(PositionType).includes(type) || id === void 0) return;

    /**
     * Authorize
     */
    const position = await service.position.findOne(parseInt(id, 10), type, type === 'teach');
    const availableActions = service.position.getPositionAction(position, auth, type);
    if (!availableActions.get(CellAction.Audit))
      throw new AuthorizeError('你暂时没有权限审核这个岗位');

    let values = {} as PositionModel;
    let auditStatusIndex: number = PositionAuditStatus[type].indexOf(position.audit);
    switch (ctx.request.body.status) {
      case '审核通过':
        if (++auditStatusIndex === PositionAuditStatus[type].length - 1) values.status = '已发布';
        if (
          (position.teaching_student_type === '研究生课程' && position.audit === '用人单位审核') ||
          (position.teaching_student_type === '本科生课程' && position.audit === '教务处审核')
        )
          auditStatusIndex++;
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
    values.audit = PositionAuditStatus[type][auditStatusIndex];
    const opinion = Array.isArray(ctx.request.body.opinion) ? ctx.request.body.opinion : [];
    values.audit_log = JSON.stringify([
      ...parseJSON(position.audit_log),
      service.position.getAuditLogItem(auth, position.audit, ctx.request.body.status, ...opinion),
    ]);
    values = ctx.model.Interships.Position.formatBack(values);
    await service.position.updateOne(parseInt(id, 10), values as any);
    ctx.response.body = { errmsg: '审核成功' };
  }

  public async form() {
    const { ctx, service } = this;
    const { auth } = ctx.request;
    const { action } = ctx.request.body as FetchFormBody;
    const { type, id } = ctx.params as { type: keyof typeof PositionType; id: string };
    if (!Object.keys(PositionType).includes(type)) return;

    let formItems: SimpleFormItemProps[] = (ctx.model.Interships.Position.toForm as any)(
      positionFormFields[type],
    );
    let initialFieldsValue: object = {};
    const decoratorOptions = { rules: [{ required: true, message: '必填项' }] };
    formItems.unshift(
      { ...filtersMap.department_code!, decoratorOptions },
      { ...filtersMap.semester!, decoratorOptions },
    );
    if (action === TopbarAction.Create) {
      if (
        !auth.scope.includes(ScopeList.position[type].create) &&
        !auth.scope.includes(ScopeList.admin)
      )
        throw new AuthorizeError('你暂时没有权限创建岗位');
      else if (!auth.scope.includes(ScopeList.admin)) {
        // if (auth.auditLink.length)
        //   formItems[0].selectOptions = formItems[0].selectOptions!.filter(
        //     (i: any) => i.level === 3,
        //   ); else if
        if (auth.auditableDep.length)
          formItems[0].selectOptions = formItems[0].selectOptions!.filter(i =>
            auth.auditableDep.includes(i.value as any),
          );
        else {
          const dep: any = await ctx.model.People.Staff.findByPk(auth.user.loginname, {
            attributes: ['department', 'department_code'],
          });
          if (dep === null || dep.get('department_code') === null)
            throw new DataNotFound('找不到你的单位信息，请联系管理员补录');
          formItems[0] = {
            id: 'department_code',
            type: SimpleFormItemType.Extra,
            extra: dep.get('department'),
            title: '用工单位',
          };
        }
      }
      formItems.unshift(...this.getUserStaticFormItems(auth));
    } else {
      const position = await service.position.findOne(parseInt(id, 10), type, type === 'teach');
      const availableActions = service.position.getPositionAction(position, auth, type);
      switch (action) {
        case CellAction.Edit:
          if (!availableActions.get(CellAction.Edit))
            throw new AuthorizeError('你暂时没有权限编辑这个岗位');
          initialFieldsValue = ctx.model.Interships.Position.formatBack(position);
          formItems.unshift(...this.getUserStaticFormItems(position));
          break;
        case CellAction.Audit:
          if (!availableActions.get(CellAction.Audit))
            throw new AuthorizeError('你暂时没有权限审核这个岗位');
          formItems = this.getUserStaticFormItems(position).concat(
            {
              id: 'department_code',
              type: SimpleFormItemType.Extra,
              extra: position.department_name,
              title: '用工单位',
            },
            ['semester', ...positionFormFields[type]].map(
              (key: string): SimpleFormItemProps => ({
                id: key,
                decoratorOptions,
                type: SimpleFormItemType.Extra,
                extra: position[key],
                title: PositionAttr[key].comment,
              }),
            ),
          );
          if (type === 'teach')
            formItems.push(
              ...teachingTaskFields.map(
                (key: string): SimpleFormItemProps => ({
                  id: key,
                  decoratorOptions,
                  type: SimpleFormItemType.Extra,
                  extra: position[key],
                  title: TaskTeachingAttr[key.replace('teaching_', '')].comment,
                }),
              ),
            );
          // if (formItems.length % 2)
          //   formItems.push({
          //     id: 'HOLD-A-PLACE',
          //     extra: '',
          //     type: SimpleFormItemType.Extra,
          //     withoutWrap: true,
          //   });
          formItems.push(...(auditFormItems as any));
          break;
        default:
          return;
      }
    }

    if (type === 'teach' && (action === TopbarAction.Create || action === CellAction.Edit))
      formItems.splice(4, 0, service.teaching.getTeachingTaskFormItem());

    ctx.response.body = {
      ...formLayoutProps,
      formItems,
      initialFieldsValue,
    };
  }

  public async getTeachingTask() {
    const { ctx, service } = this;
    const { auth } = ctx.request;
    const { search } = ctx.params as { search: string };
    if (!search) return (ctx.response.body = []);
    ctx.response.body = await service.teaching.getTeachingTaskSelection(
      search,
      auth.auditLink.length || auth.scope.includes(ScopeList.admin) ? void 0 : auth.user.loginname,
    );
  }

  /**
   * 获取不可修改的表单内容，这里是用户信息
   */
  private getUserStaticFormItems(info: AuthResult | PositionModel): SimpleFormItemProps[] {
    return [
      {
        id: 'loginname',
        type: SimpleFormItemType.Extra,
        extra: 'user' in info ? info.user.loginname : info.staff_jobnum,
        title: '负责人工号',
      },
      {
        id: 'username',
        type: SimpleFormItemType.Extra,
        extra: 'user' in info ? info.user.username : (info as any).staff_name,
        title: '负责人姓名',
      },
    ];
  }
}
