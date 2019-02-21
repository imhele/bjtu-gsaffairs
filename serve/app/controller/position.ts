import { Controller } from 'egg';
import { getFromIntEnum } from '../utils';
import { ScopeList } from '../service/user';
import { AuthorizeError } from '../errcode';
import { AuthResult } from '../extend/request';
import { Op, WhereNested, WhereOptions } from 'sequelize';
import { StepsProps } from '../../../src/components/Steps';
import { PositionState } from '../../../src/models/connect';
import { CellAction } from '../../../src/pages/Position/consts';
import { SimpleFormItemType } from '../../../src/components/SimpleForm';
import { filtersKeyMap, filtersMap, getFilters } from './positionFilter';
import { FetchListBody, FetchDetailBody } from '../../../src/api/position';
import { StandardTableActionProps } from '../../../src/components/StandardTable';
import { detailColumns, operationArea, tableColumns, tableQueryFields } from './position.json';
import {
  DepartmentAttr,
  PositionAttr,
  PositionAuditStatus,
  PositionModel,
  PositionStatus,
  PositionType,
  StaffAttr,
} from '../model';

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
    // const { auth } = ctx.request; @DEBUG
    const auth = {
      scope: ['scope.position.manage.audit'] as string[],
      auditableDep: [''],
      user: { loginname: '' },
      auditLink: ['研工部审核'],
    } as AuthResult;
    const body = ctx.request.body as FetchListBody;
    const { type } = ctx.params as { type: keyof typeof PositionType };
    const positionType: number = (PositionAttr.types as any).values.indexOf(PositionType[type]);
    const { limit = 10, offset = 0 } = body;
    if (positionType === -1) return;

    let columns = [...tableColumns];
    let filtersKey = filtersKeyMap[type].withStatus;
    if (type !== 'manage') columns = columns.filter(({ dataIndex }) => dataIndex !== 'class_type');

    /**
     * Construct `filtersValue`
     */
    const filters = [body.filtersValue || {}] as WhereOptions<PositionModel & WhereNested>[];
    Object.keys(filters).forEach(key => {
      if (filtersMap[key] && filtersMap[key].type === SimpleFormItemType.Input) {
        /* Input 类型使用模糊查询 */
        filters[key] = { [Op.like]: filters[key] };
      }
    });
    filters[0].types = positionType;
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
        filtersKey = filtersKeyMap[type].withoutStatus;
        columns = columns.filter(({ dataIndex }) => dataIndex !== 'status');
        filters[0].status = getFromIntEnum(PositionAttr, 'status', null, '已发布');
      }
    }

    /**
     * Qurey batabase
     */
    const { positions, total } = await service.position.findSomeWithDep({
      limit,
      offset,
      count: true,
      attributes: tableQueryFields,
      where: { [Op.and]: filters },
      depAttributes: ['name'],
    });

    /**
     * Format dataSource
     */
    const dataSource = positions.map(item => {
      const availableActions = this.getPositionAction(item, auth, type);
      availableActions.delete(CellAction.Preview);
      const action: StandardTableActionProps = Array.from(availableActions.keys()).map(
        actionItem => ({
          text: ActionText[actionItem],
          type: actionItem,
        }),
      );
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
    if (!Object.keys(PositionType).includes(type) || !id) return;

    let columnKeys: string[] = detailColumns.withoutAuditLog;
    const position = await service.position.findOne(id);

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
    if (availableActions.has(CellAction.Audit)) {
      columnKeys = detailColumns.withAuditLog;
      stepsProps.current = PositionAuditStatus[type].indexOf(position.audit!);
      stepsProps.status = PositionStatus[position.status!];
      stepsProps.steps = PositionAuditStatus[type].map((title: string) => ({ title }));
    }

    /**
     * Format values
     */
    // [['a', 'b'], ['c']] => 'a,b\nc'
    position.audit_log = position.audit_log.join('\n') as any;

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
        span: key === 'audit_log' ? 24 : void 0,
      };
    });
    Object.entries(StaffAttr).forEach(([key, value]: any) => {
      columnsObj[key] = {
        dataIndex: `staff_${key}`,
        title: key === 'name' ? '负责人姓名' : value.comment,
      };
    });
    Object.entries(DepartmentAttr).map(([key, value]: any) => {
      columnsObj[key] = {
        dataIndex: `department_${key}`,
        title: value.comment,
      };
    });
    const columns = columnKeys
      .map(col => columnsObj[col])
      .filter(col => position[col.dataIndex] !== null);

    /**
     * Filter out other data in `position`.
     */
    const dataSource: { [K in keyof PositionModel]?: string } = {};
    columns.forEach(col => (dataSource[col.dataIndex] = position[col.dataIndex]));

    ctx.response.body = { columns, dataSource, stepsProps };
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
          // @TODO 学生已申请岗位时，状态不可用
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
