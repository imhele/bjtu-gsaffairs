import { Controller } from 'egg';
import { getFromIntEnum } from '../utils';
import { ScopeList } from '../service/user';
import { AuthorizeError } from '../errcode';
import { AuthResult } from '../extend/request';
import { Op, WhereNested, WhereOptions } from 'sequelize';
import { StepsProps } from '../../../src/components/Steps';
import { PositionState } from '../../../src/models/connect';
import { attr as DepartmentAttr } from '../model/dicts/department';
import { filtersKeyMap, filtersMap, getFilters } from './positionFilter';
import { CellAction, TopbarAction } from '../../../src/pages/Position/consts';
import { StandardTableActionProps } from '../../../src/components/StandardTable';
import { SimpleFormItemType, SimpleFormItemProps } from '../../../src/components/SimpleForm';
import {
  PositionAttr,
  PositionAuditStatus,
  PositionModel,
  PositionStatus,
  PositionType,
  StaffInfoAttr,
} from '../model';
import {
  FetchListBody,
  FetchDetailBody,
  DeletePositionBody,
  EditPositionBody,
  AuditPositionBody,
  FetchFormBody,
} from '../../../src/api/position';
import {
  auditFormItems,
  createReturn,
  detailColumns,
  formLayoutProps,
  operationArea,
  positionFormFields,
  tableColumns,
  tableQueryFields,
} from './position.json';

const ActionText = {
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
    if (type !== 'teach') columns = columns.filter(({ dataIndex }) => dataIndex !== 'class_type');

    /**
     * Construct `filtersValue`
     */
    let attributes = tableQueryFields.withStatus;
    const filters = [{ ...body.filtersValue } || {}] as WhereOptions<PositionModel & WhereNested>[];
    Object.keys(filters[0]).forEach(key => {
      if (filtersMap[key] && filtersMap[key].type === SimpleFormItemType.Input)
        /* Input 类型使用模糊查询 */
        filters[0][key] = { [Op.like]: `%${filters[0][key]}%` };
    });
    filters[0].types = positionType as number;
    if (
      !auth.scope.includes(ScopeList.admin) &&
      !auth.scope.includes(ScopeList.position[type].audit)
    ) {
      if (auth.scope.includes(ScopeList.position[type].create)) {
        /* 没有审核权限的用户只能检索到已发布的岗位或自己创建的岗位 */
        filters.push({
          [Op.or]: [
            { status: getFromIntEnum(PositionAttr, 'status', null, '已发布') },
            { staff_jobnum: auth.user.loginname },
          ],
        });
      } else {
        /* 既没有审核权限，也没有创建权限 */
        attributes = tableQueryFields.withoutStatus;
        filtersKey = filtersKeyMap[type].withoutStatus;
        filters[0].status = getFromIntEnum(PositionAttr, 'status', null, '已发布');
      }
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
      const availableActions = this.getPositionAction(item, auth, type);
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
      actionKey: ['action', 'name'],
      selectable: { columnWidth: 57 },
    };
    if (!offset) result.operationArea = operationArea;
    if (!body.filtersValue || !Object.keys(body.filtersValue).length) {
      result.filters = getFilters(filtersKey);
    }

    ctx.response.body = result;
  }

  public async detail() {
    const { ctx, service } = this;
    const { auth } = ctx.request;
    const { type } = ctx.params as { type: keyof typeof PositionType };
    const { key: id } = ctx.request.body as FetchDetailBody;
    if (!Object.keys(PositionType).includes(type) || id === void 0) return;

    let columnsKey: string[] = detailColumns.withoutAuditLog;
    const position = await service.position.findOne(parseInt(id as string, 10));

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
    const availableActions = this.getPositionAction(position, auth, type);
    if (!availableActions.get(CellAction.Preview))
      throw new AuthorizeError('你暂时没有权限查看这个岗位的信息');
    if (availableActions.has(CellAction.Audit) || availableActions.has(CellAction.Edit)) {
      columnsKey = detailColumns.withAuditLog;
      stepsProps.current = PositionAuditStatus[type].indexOf(position.audit!);
      stepsProps.status = PositionStatus[position.status!];
      stepsProps.steps = PositionAuditStatus[type].map((title: string) => ({ title }));
    }

    /**
     * Format values
     */
    // [['a', 'b'], ['c']] => 'a，b\nc'
    position.audit_log = position.audit_log
      .map(i => (Array.isArray(i) ? i.join('，') : i))
      .join(`\n`) as any;

    /**
     * Construct `columns`.
     */
    const columnsObj: {
      [key: string]: {
        dataIndex: string;
        title: string;
        span?: number;
      };
    } = {};
    Object.entries(PositionAttr).forEach(([key, value]: any) => {
      /**
       * @Component `DescriptionList`
       * @Ref /src/components/DescriptionList/index.tsx#L26-L31
       * `span` is for layout
       */
      columnsObj[key] = {
        dataIndex: key,
        title: value.comment,
        ...(key === 'audit_log' ? { sm: 24, md: 24 } : void 0),
      };
    });
    Object.entries(StaffInfoAttr).forEach(([dataIndex, value]: any) => {
      dataIndex = `staff_${dataIndex}`;
      columnsObj[dataIndex] = {
        dataIndex,
        title: dataIndex === 'staff_name' ? '负责人姓名' : value.comment,
      };
    });
    Object.entries(DepartmentAttr).forEach(([dataIndex, value]: any) => {
      dataIndex = `department_${dataIndex}`;
      columnsObj[dataIndex] = { dataIndex, title: value.comment };
    });
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

    const values = { ...ctx.request.body } as PositionModel<true>;
    values.types = getFromIntEnum(PositionAttr, 'types', null, PositionType[type]) as number;
    values.status = getFromIntEnum(PositionAttr, 'status', null, '待审核') as number;
    values.audit = getFromIntEnum(PositionAttr, 'audit', null, PositionAuditStatus[type][1]) as any;
    values.audit_log = [service.position.getAuditLogItem(auth, PositionAuditStatus[type][0])];
    values.staff_jobnum = auth.user.loginname;
    await service.position.addOne(values as any);

    /**
     * Construct `stepsProps`.
     */
    const stepsProps: StepsProps = {
      current: 1,
      steps: PositionAuditStatus[type].map(title => ({ title })),
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
    const { type } = ctx.params as { type: keyof typeof PositionType };
    const { key: id } = ctx.request.body as DeletePositionBody;
    if (!Object.keys(PositionType).includes(type) || id === void 0) return;

    /**
     * Authorize
     */
    const position = await service.position.findOne(parseInt(id as string, 10));
    const availableActions = this.getPositionAction(position, auth, type);
    if (!availableActions.get(CellAction.Delete))
      throw new AuthorizeError('你暂时没有权限删除这个岗位');

    await service.position.deleteOne(parseInt(id as string, 10));
    ctx.response.body = { errmsg: '删除成功' };
  }

  public async edit() {
    const { ctx, service } = this;
    const { auth } = ctx.request;
    const { type } = ctx.params as { type: keyof typeof PositionType };
    const { key: id } = ctx.request.body as EditPositionBody;
    if (!Object.keys(PositionType).includes(type) || id === void 0) return;

    /**
     * Authorize
     */
    const position = await service.position.findOne(parseInt(id as string, 10));
    const availableActions = this.getPositionAction(position, auth, type);
    if (!availableActions.get(CellAction.Edit))
      throw new AuthorizeError('你暂时没有权限编辑这个岗位');

    delete ctx.request.body.key;
    const values = { ...ctx.request.body } as PositionModel<true>;
    delete values.types;
    values.status = getFromIntEnum(PositionAttr, 'status', null, '待审核') as number;
    values.audit = getFromIntEnum(PositionAttr, 'audit', null, PositionAuditStatus[type][1]) as any;
    values.audit_log = [
      ...position.audit_log,
      service.position.getAuditLogItem(auth, PositionAuditStatus[type][0]),
    ];
    values.staff_jobnum = auth.user.loginname;
    await service.position.updateOne(parseInt(id as string, 10), values as any);
    ctx.response.body = { errmsg: '提交成功' };
  }

  public async audit() {
    const { ctx, service } = this;
    const { auth } = ctx.request;
    const { type } = ctx.params as { type: keyof typeof PositionType };
    const { key: id } = ctx.request.body as AuditPositionBody;
    if (!Object.keys(PositionType).includes(type) || id === void 0) return;

    /**
     * Authorize
     */
    const position = await service.position.findOne(parseInt(id as string, 10));
    const availableActions = this.getPositionAction(position, auth, type);
    if (!availableActions.get(CellAction.Audit))
      throw new AuthorizeError('你暂时没有权限审核这个岗位');

    const values = {} as PositionModel<true>;
    let auditStatusIndex: number = PositionAuditStatus[type].indexOf(position.audit);
    switch (ctx.request.body.status) {
      case '审核通过':
        if (++auditStatusIndex === PositionAuditStatus[type].length - 1)
          values.status = getFromIntEnum(PositionAttr, 'status', null, '已发布') as number;
        break;
      case '审核不通过':
        values.status = getFromIntEnum(PositionAttr, 'status', null, '审核不通过') as number;
        break;
      case '退回':
        auditStatusIndex = 0;
        values.status = getFromIntEnum(PositionAttr, 'status', null, '草稿') as number;
        break;
      default:
        return;
    }
    const auditStatus = PositionAuditStatus[type][auditStatusIndex];
    const opinion = Array.isArray(ctx.request.body.opinion) ? ctx.request.body.opinion : [];
    values.audit = getFromIntEnum(PositionAttr, 'audit', null, auditStatus) as number;
    values.audit_log = position.audit_log.concat([
      service.position.getAuditLogItem(auth, position.audit, ctx.request.body.status, ...opinion),
    ]);
    await service.position.updateOne(parseInt(id as string, 10), values as any);
    ctx.response.body = { errmsg: '审核成功' };
  }

  public async form() {
    const { ctx, service } = this;
    const { auth } = ctx.request;
    const { type } = ctx.params as { type: keyof typeof PositionType };
    const { key: id, action } = ctx.request.body as FetchFormBody;
    if (!Object.keys(PositionType).includes(type)) return;

    let formItems: SimpleFormItemProps[] = (ctx.model.Interships.Position as any).toForm(
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
      formItems.unshift(...this.getUserStaticFormItems(auth));
    } else {
      const position = await service.position.findOne(parseInt(id as string, 10));
      const availableActions = this.getPositionAction(position, auth, type);
      switch (action) {
        case CellAction.Edit:
          if (!availableActions.get(CellAction.Edit))
            throw new AuthorizeError('你暂时没有权限编辑这个岗位');
          initialFieldsValue = position;
          formItems.unshift(...this.getUserStaticFormItems(position));
          break;
        case CellAction.Audit:
          if (!availableActions.get(CellAction.Audit))
            throw new AuthorizeError('你暂时没有权限审核这个岗位');
          formItems = this.getUserStaticFormItems(position).concat(
            {
              id: 'department_code',
              decoratorOptions,
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

  /**
   * 获取当前岗位有权限的操作列表
   */
  private getPositionAction(
    position: PositionModel,
    { auditableDep, auditLink, scope, user }: AuthResult,
    type: keyof typeof PositionType,
  ) {
    const action: Map<CellAction, boolean> = new Map();
    if (scope.includes(ScopeList.admin)) {
      action.set(CellAction.Preview, true);
      action.set(CellAction.Delete, true);
      action.set(CellAction.Edit, true);
      action.set(CellAction.Audit, true);
    } else {
      /* 已发布的岗位所有人可见 */
      if (position.status === '已发布') {
        action.set(CellAction.Preview, true);
        /* 学生可申请已发布的岗位 */
        if (scope.includes(ScopeList.position[type].apply)) {
          // @TODO 学生已申请岗位时，状态不可用，目前直接在用户进入申请页时判断权限
          action.set(CellAction.Apply, true);
        }
      }
      /* 有审核权限的管理员可以查看非 `已发布` 状态的岗位 */
      if (scope.includes(ScopeList.position[type].audit)) {
        action.set(CellAction.Preview, true);
      }
      /* 用户可以访问和删除自己发布的岗位 */
      if (position.staff_jobnum === user.loginname) {
        action.set(CellAction.Preview, true);
        action.set(CellAction.Delete, true);
        /* 草稿状态下可以编辑 */
        action.set(CellAction.Edit, position.status === '草稿');
      }
      /* 根据岗位审核进度设定审核权限可用状态 */
      if (auditableDep.includes(position.department_code!)) {
        action.set(
          CellAction.Audit,
          position.audit === '用人单位审核' && position.status === '待审核',
        );
      }
      if (auditLink.includes(position.audit)) {
        action.set(CellAction.Audit, position.status === '待审核');
      }
    }
    return action;
  }
}
