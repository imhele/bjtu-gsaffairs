import { Controller } from 'egg';
import { ScopeList } from '../service/user';
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
    const { type } = ctx.params;
    if (!Object.values(PositionType).includes(type)) return;
    const { filtersValue, limit = 10, offset = 0 } = ctx.request.body as FetchListBody;
    const positions = await service.position.findSomeWithDep(limit, offset);
    const result: Partial<PositionState> = {};
    ctx.response.body = result;
  }

  public async detail() {
    const { ctx, service } = this;
    const { type } = ctx.params;
    if (!Object.values(PositionType).includes(type)) return;
    const { key: id } = ctx.request.body as FetchDetailBody;
    if (!id) return;
    let columnKeys: string[] = [];
    const position = await service.position.findOne(id);
    if (
      ctx.request.auth.scope.includes(ScopeList.position[type].audit) ||
      position.staff_loginname === ctx.request.auth.user.loginname ||
      ctx.request.auth.scope.includes(ScopeList.admin)
    ) {
      /* The above users can view the audit records at any time. */
      columnKeys = detailColumns.withAuditLog;
    } else if (position.status === 4) /* '已发布' */ columnKeys = detailColumns.withoutAuditLog;
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
      // Handle enum type
      if (value.values) {
        position[key] = value.values[position[key]];
      }
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
        title: key === 'username' ? '负责人姓名' : value.comment,
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

    /**
     * Construct `stepsProps`.
     */
    const stepsProps: StepsProps = {
      current: PositionAuditStatus[type].indexOf(dataSource.audit!),
      labelPlacement: 'vertical',
      status: PositionStatus[dataSource.status!],
      steps: PositionAuditStatus[type].map((title: string) => ({ title })),
    };
    ctx.response.body = { columns, dataSource, stepsProps };
  }
}
