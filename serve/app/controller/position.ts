import { Controller } from 'egg';
import { WhereOptions } from 'sequelize';
import { ScopeList, UserType } from '../service/user';
import { AuthorizeError } from '../errcode';
import { detailColumns } from './position.json';
import { StepsProps } from '../../../src/components/Steps';
import { PositionState } from '../../../src/models/connect';
import { FetchListBody, FetchDetailBody } from '../../../src/api/position';
import {
  DepartmentAttr,
  PositionAttr,
  PositionAuditStatus,
  PositionModel,
  PositionStatus,
  PositionType,
  StaffAttr,
} from '../model';

export default class PositionController extends Controller {
  public async list() {
    const { ctx, service } = this;
    const { auth } = ctx.request;
    const body = ctx.request.body as FetchListBody;
    const { type } = ctx.params as { type: PositionType };
    const positionType: number = Object.values(PositionType).indexOf(type);
    const { limit = 10, offset = 0 } = body;
    if (positionType === -1) return;

    /**
     * Construct `filtersValue`
     */
    const columnKeys: string[] = [];
    const filtersValue = (body.filtersValue || {}) as WhereOptions<PositionModel>;
    filtersValue.types = positionType;
    if (!auth.scope.includes(ScopeList.admin)) {
      /* 没有审核权限的用户只能检索到已发布的岗位 */
      if (!auth.scope.includes(ScopeList.position[type].audit)) {
        filtersValue.status = (PositionAttr.status as any).values.indexOf('已发布');
      } else filtersValue.department_code = { $in: auth.auditableDep };
    }
    const positions = await service.position.findSomeWithDep(limit, offset);
    const result: Partial<PositionState> = {};
    ctx.response.body = result;
  }

  public async detail() {
    const { ctx, service } = this;
    const { auth } = ctx.request;
    const { type } = ctx.params as { type: PositionType };
    const { key: id } = ctx.request.body as FetchDetailBody;
    if (!Object.values(PositionType).includes(type) || !id) return;

    let columnKeys: string[] = [];
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
    if (
      position.staff_jobnum === auth.user.loginname ||
      auth.scope.includes(ScopeList.admin) ||
      (auth.scope.includes(ScopeList.position[type].audit) &&
        auth.auditableDep.includes(position.department_code!))
    ) {
      /* The above users can view the audit records at any time. */
      columnKeys = detailColumns.withAuditLog;
      stepsProps.current = PositionAuditStatus[type].indexOf(position.audit!);
      stepsProps.status = PositionStatus[position.status!];
      stepsProps.steps = PositionAuditStatus[type].map((title: string) => ({ title }));
    } else if (position.status === (PositionAttr.status as any).values.indexOf('已发布'))
      columnKeys = detailColumns.withoutAuditLog;
    else throw new AuthorizeError('你暂时没有权限查看这个岗位的信息');

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
}
