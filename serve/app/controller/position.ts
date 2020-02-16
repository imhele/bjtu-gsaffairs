import { Controller } from 'egg';
import { AuthResult } from '../extend/request';
import { getFromIntEnum, parseJSON } from '../utils';
import { ScopeList, UserType } from '../service/user';
import { Op, WhereOptions, IncludeOptions } from 'sequelize';
// import { StepsProps } from '../../../src/components/Steps';
// import { PositionState } from '../../../src/models/connect';
import { attr as TaskTeachingAttr } from '../model/task/teaching';
import { CellAction, SimpleFormItemType, TopbarAction } from '../link';
// import { FetchListBody, FetchFormBody } from '../../../src/api/position';
import { filtersKeyMap, filtersMap, getFilters } from './positionFilter';
import { PositionWithFK as PositionModelWithFK } from '../service/position';
import { AuthorizeError, DataNotFound, OperationIgnored } from '../errcode';
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
    body.filtersValue = body.filtersValue || {};
    const { student_type } = body.filtersValue;
    delete body.filtersValue.student_type;
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
        // filters.push({
        //   [Op.or]: [
        //     { status: ctx.model.Interships.Position.formatBack({ status: '已发布' }).status },
        //     { staff_jobnum: auth.user.loginname },
        //   ],
        // });
        filters.push({ staff_jobnum: auth.user.loginname });
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
    const include: IncludeOptions[] = [];
    if (type === 'teach') {
      if (student_type === void 0)
        include.push({
          model: ctx.model.Task.Teaching,
          attributes: ['student_type'],
        });
      else if (student_type) {
        include.push({
          model: ctx.model.Task.Teaching,
          attributes: ['student_type'],
          where: { student_type },
        });
      } else {
        filters.push({ task_teaching_id: null });
      }
    }

    /**
     * Qurey batabase
     */
    const { positions, total } = await service.position.findSomeWithDep({
      limit,
      offset,
      include,
      attributes,
      count: true,
      where: { [Op.and]: filters },
      depAttributes: ['name'],
    });

    /**
     * Format dataSource
     */
    let applyunable: boolean = true;
    if (auth.scope.includes(ScopeList.position[type].apply))
      applyunable = await service.stuapply.hasOnePassedApplication(auth.user.loginname, type);
    const dataSource = positions.map(item => {
      const availableActions = service.position.getPositionAction(item, auth, type, applyunable);
      availableActions.delete(CellAction.Preview);
      const action: StandardTableActionProps = Array.from(availableActions.entries())
        .filter(([_, enable]) => enable)
        .map(([actionItem]) => ({
          text: ActionText[actionItem],
          type: actionItem,
        }));
      return {
        ...item,
        pass_num: 0,
        name: {
          type: CellAction.Preview,
          text: item.name,
        } as StandardTableActionProps,
        action: action.length ? action : '--',
      };
    });

    // tslint:disable-next-line: forin
    for (const index in dataSource) {
      dataSource[index].pass_num = await service.stuapply.countApplySuccess(dataSource[index].id!);
    }

    /**
     * Construct result
     */
    const result: Partial<PositionState> = {
      columns,
      dataSource,
      total,
      rowKey: 'id',
      operationArea,
      scroll: { x: 1200 },
      filters: getFilters(filtersKey),
      actionKey: ['action', 'name'],
      selectable: hasAuditScope && { columnWidth: 57 },
    };

    const auditFilter = result.filters.find((item: SimpleFormItemProps) => item.id === 'audit');
    if (auditFilter)
      auditFilter.selectOptions = PositionAuditStatus[type].map((title, index) => ({
        value: this.getPostAuditVal(type, index),
        title,
      }));

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
    const availableActions = service.position.getPositionAction(position, auth, type, true);
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

    let staffJobnum: string = auth.user.loginname;
    let departmentCode: string | null = null;
    if (auth.auditableDep.length) departmentCode = ctx.request.body.department_code;
    if (type === 'teach') {
      const { task_teaching_id } = ctx.request.body;
      const hasCreated = await service.teaching.hasCreatedPosition(task_teaching_id);
      if (hasCreated) throw new AuthorizeError('此课程已申请过岗位');
      if (
        task_teaching_id ||
        (!auth.auditableDep.length && !auth.scope.includes(ScopeList.admin))
      ) {
        const taskInfo = await service.teaching.getTeachingTaskInfo(task_teaching_id, auth);
        ctx.request.body.name = taskInfo.name;
        staffJobnum = taskInfo.jsh;
        departmentCode = taskInfo.dep;
      } else {
        staffJobnum = ctx.request.body.staff_jobnum || staffJobnum;
        departmentCode = ctx.request.body.department_code;
      }
    }
    if (!departmentCode) {
      const dep: any = await ctx.model.People.Staff.findByPk(auth.user.loginname, {
        attributes: ['department_code'],
      });
      if (dep !== null && dep.get('department_code') !== null)
        departmentCode = dep.get('department_code');
    }
    const values = ctx.model.Interships.Position.formatBack({
      ...ctx.request.body,
      department_code: departmentCode,
      audit: this.getPostAuditVal(type, 1),
      staff_jobnum: staffJobnum,
      status: '待审核',
      types: PositionType[type],
      audit_log: JSON.stringify([
        service.position.getAuditLogItem(auth, PositionAuditStatus[type][0]),
      ]),
    });
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
    const availableActions = service.position.getPositionAction(position, auth, type, true);
    if (!availableActions.get(CellAction.Delete))
      throw new AuthorizeError('你暂时没有权限删除这个岗位');
    const hasApply = await ctx.model.Interships.Stuapply.findOne({
      where: { position_id: parseInt(id, 10) },
    });
    if (hasApply) throw new OperationIgnored('请先删除此岗位的学生申请记录');

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
    const availableActions = service.position.getPositionAction(position, auth, type, true);
    if (!availableActions.get(CellAction.Edit))
      throw new AuthorizeError('你暂时没有权限编辑这个岗位');

    delete ctx.request.body.id;
    delete ctx.request.body.types;
    if (type === 'teach')
      if (!auth.scope.includes(ScopeList.admin) && !auth.auditableDep.length) {
        delete ctx.request.body.name;
        delete ctx.request.body.staff_jobnum;
      }
    const hasPublished = position.status === '已发布';
    const values = ctx.model.Interships.Position.formatBack({
      ...ctx.request.body,
      // 有审核权限的员工编辑岗位后将不会改变当前审核环节
      audit:
        availableActions.get(CellAction.Audit) || hasPublished
          ? position.audit
          : this.getPostAuditVal(type, 1),
      status: hasPublished ? position.status : '待审核',
      audit_log: JSON.stringify([
        ...parseJSON(position.audit_log),
        service.position.getAuditLogItem(auth, '编辑岗位'),
      ]),
    });
    await service.position.updateOne(parseInt(id, 10), values);
    ctx.response.body = { errmsg: '提交成功' };
  }

  public async auditItem(id: string, type: keyof typeof PositionType) {
    const { ctx, service } = this;
    const { auth } = ctx.request;

    /**
     * Authorize
     */
    const position = await service.position.findOne(parseInt(id, 10), type, type === 'teach');
    const availableActions = service.position.getPositionAction(position, auth, type, true);
    if (!availableActions.get(CellAction.Audit))
      throw new AuthorizeError('你暂时没有权限审核这个岗位');

    const values = {} as PositionModel<true>;
    let auditStatusIndex: number = PositionAuditStatus[type].indexOf(position.audit);
    switch (ctx.request.body.status) {
      case '审核通过':
        if (++auditStatusIndex === PositionAuditStatus[type].length - 1)
          values.status = '已发布' as any;
        if (type === 'teach')
          if (
            position.audit === '教务处审核' ||
            (position.teaching_student_type === '研究生课程' && position.audit === '用人单位审核')
          )
            auditStatusIndex++;
        break;
      case '废除':
        values.status = '废除' as any;
        break;
      case '退回':
        auditStatusIndex = 0;
        values.status = '草稿' as any;
        break;
      default:
        throw new DataNotFound('无效的审核选项');
    }
    const opinion = Array.isArray(ctx.request.body.opinion) ? ctx.request.body.opinion : [];
    values.audit_log = JSON.stringify([
      ...parseJSON(position.audit_log),
      service.position.getAuditLogItem(auth, position.audit, ctx.request.body.status, ...opinion),
    ]);
    values.status = ctx.model.Interships.Position.formatBack({ status: values.status }).status;
    values.audit = this.getPostAuditVal(type, auditStatusIndex);
    await service.position.updateOne(parseInt(id, 10), values as any);
  }

  public async audit() {
    const { type, id } = this.ctx.params as { type: keyof typeof PositionType; id: string };
    if (!Object.keys(PositionType).includes(type) || id === void 0) return;
    await this.auditItem(id, type);
    this.ctx.response.body = { errmsg: '审核成功' };
  }

  public async batchAudit() {
    const { type } = this.ctx.params as { type: keyof typeof PositionType };
    const { keys } = this.ctx.request.body;
    if (!Object.keys(PositionType).includes(type) || !Array.isArray(keys)) return;
    for (const id of keys) await this.auditItem(id, type);
    this.ctx.response.body = { errmsg: '审核成功' };
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
    if (action === TopbarAction.Create) {
      if (
        !auth.scope.includes(ScopeList.position[type].create) &&
        !auth.scope.includes(ScopeList.admin)
      )
        throw new AuthorizeError('你暂时没有权限创建岗位');
      formItems.unshift(await this.getSemester());
      if (auth.scope.includes(ScopeList.admin)) {
        formItems.unshift({
          ...filtersMap.department_code!,
          decoratorOptions: type === 'teach' ? void 0 : decoratorOptions,
        });
        if (type === 'teach')
          formItems.unshift(
            {
              id: 'staff_jobnum',
              type: SimpleFormItemType.Input,
              title: '负责人工号',
            },
            ...ctx.model.Interships.Position.toForm(['name']),
          );
      } else if (type === 'manage') {
        if (auth.auditableDep.length) {
          formItems.unshift({
            ...filtersMap.department_code!,
            selectOptions: filtersMap.department_code.selectOptions!.filter((i: any) =>
              auth.auditableDep.includes(i.value),
            ),
            decoratorOptions,
          });
        } else {
          const dep: any = await ctx.model.People.Staff.findByPk(auth.user.loginname, {
            attributes: ['department', 'department_code'],
          });
          if (dep === null || dep.get('department_code') === null)
            throw new DataNotFound('找不到你的单位信息，请联系管理员补录');
          formItems.unshift({
            id: 'department_code',
            type: SimpleFormItemType.Extra,
            extra: dep.get('department'),
            title: '用工单位',
          });
        }
      } else if (auth.auditableDep.length) {
        formItems.unshift(
          {
            id: 'staff_jobnum',
            type: SimpleFormItemType.Input,
            title: '负责人工号',
          },
          ...ctx.model.Interships.Position.toForm(['name']),
        );
      }

      if (type === 'teach')
        formItems.splice(4, 0, {
          ...service.teaching.getTeachingTaskFormItem(),
          decoratorOptions: auth.auditableDep.length ? void 0 : decoratorOptions,
        });
    } else {
      const position = await service.position.findOne(parseInt(id, 10), type, type === 'teach');
      const availableActions = service.position.getPositionAction(position, auth, type, true);
      switch (action) {
        case CellAction.Edit:
          if (!availableActions.get(CellAction.Edit))
            throw new AuthorizeError('你暂时没有权限编辑这个岗位');
          initialFieldsValue = ctx.model.Interships.Position.formatBack(position);
          if (type === 'teach')
            if (auth.auditableDep.length || auth.scope.includes(ScopeList.admin))
              formItems.unshift(...ctx.model.Interships.Position.toForm(['name']));
          formItems.unshift(...this.getUserStaticFormItems(position, auth, true, type === 'teach'));
          if (type === 'teach')
            formItems.splice(4, 0, {
              ...service.teaching.getTeachingTaskFormItemByPosition(position),
              decoratorOptions: auth.auditableDep.length ? void 0 : decoratorOptions,
            });
          break;
        case CellAction.Audit:
          if (!availableActions.get(CellAction.Audit))
            throw new AuthorizeError('你暂时没有权限审核这个岗位');
          formItems = this.getUserStaticFormItems(position, auth).concat(
            positionFormFields[type].map(
              (key: string): SimpleFormItemProps => ({
                id: key,
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

  public getPostAuditVal(type: keyof typeof PositionType, value: string | number) {
    if (typeof value === 'number')
      return type === 'manage' ? value : PositionAuditStatus.manage.length + value;
    else return this.getPostAuditVal(type, PositionAuditStatus[type].indexOf(value));
  }

  /**
   * 获取不可修改的表单内容，这里是用户信息
   */
  private getUserStaticFormItems(
    info: PositionModelWithFK,
    auth: AuthResult,
    editable: boolean = false,
    isTeach: boolean = false,
  ): SimpleFormItemProps[] {
    const res: SimpleFormItemProps[] = [
      {
        id: 'loginname',
        type: SimpleFormItemType.Extra,
        extra: info.staff_jobnum,
        title: '负责人工号',
      },
      {
        id: 'username',
        type: SimpleFormItemType.Extra,
        extra: info.staff_name,
        title: '负责人姓名',
      },
      {
        id: 'department_code',
        type: SimpleFormItemType.Extra,
        extra: info.department_name,
        title: '用工单位',
      },
      {
        id: 'semester',
        type: SimpleFormItemType.Extra,
        extra: info.semester,
        title: '学年学期',
      },
    ];
    if (editable) {
      const decoratorOptions = { rules: [{ required: true, message: '必填项' }] };
      if (auth.scope.includes(ScopeList.admin)) {
        if (isTeach)
          res[0] = {
            id: 'staff_jobnum',
            type: SimpleFormItemType.Input,
            title: '负责人工号',
            tip: '更改工号并提交后，负责人姓名会自动更新',
          };
        res[2] = {
          ...filtersMap.department_code!,
          decoratorOptions,
        };
      } else if (auth.auditableDep.length) {
        if (isTeach)
          res[0] = {
            id: 'staff_jobnum',
            type: SimpleFormItemType.Input,
            title: '负责人工号',
            tip: '更改工号并提交后，负责人姓名会自动更新',
          };
        res[2] = {
          ...filtersMap.department_code!,
          selectOptions: filtersMap.department_code.selectOptions!.filter((i: any) =>
            auth.auditableDep.includes(i.value),
          ),
          decoratorOptions,
        };
      }
      res[3] = { ...filtersMap.semester!, decoratorOptions };
    }
    return res;
  }

  private async getSemester() {
    const config = this.ctx.model.Interships.Config.findOne();
    const semesters = JSON.parse((config && config.get('available_semesters')) || '[]');
    return {
      ...filtersMap.semester!,
      selectOptions: semesters.map((value: string) => ({ value })),
      decoratorOptions: { rules: [{ required: true, message: '必填项' }] },
    };
  }
}
