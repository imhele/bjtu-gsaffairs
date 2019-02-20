import { Controller } from 'egg';
import { detailColumns } from './position.json';
import { StepsProps } from '../../../src/components/Steps';
import { FetchDetailBody } from '../../../src/api/position';
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
    const {
      ctx: { response },
      service,
    } = this;
  }

  public async detail() {
    const { ctx, service } = this;
    const { type } = ctx.params;
    if (!Object.values(PositionType).includes(type)) return;
    const { key: id } = ctx.request.body as FetchDetailBody;
    if (!id) return;
    const position = await service.position.findOne(id);
    /**
     * Format values
     */
    // [['a', 'b'], ['c']] => 'a,b\nc'
    position.audit_log = position.audit_log.join('\n') as any;
    Object.entries(position.Department).forEach(([key, value]) => {
      position[`department_${key}`] = value;
    });
    Object.entries(position.Staff).forEach(([key, value]) => {
      position[`staff_${key}`] = value;
    });
    delete position.Staff;
    delete position.Department;

    /**
     * Construct `columns`.
     */
    const columns = [
      ...Object.entries(PositionAttr).map(([key, value]: any) => {
        // Handle enum type
        if (value.values) {
          position[key] = value.values[position[key]];
        }
        /**
         * @Component `DescriptionList`
         * @Ref /src/components/DescriptionList/index.tsx#L26-L31
         * `span` is for layout
         */
        return {
          dataIndex: key,
          title: value.comment,
          span: key === 'audit_log' ? 24 : void 0,
        };
      }),
      ...Object.entries(StaffAttr).map(([key, value]: any) => ({
        dataIndex: `staff_${key}`,
        title: value.comment,
      })),
      ...Object.entries(DepartmentAttr).map(([key, value]: any) => ({
        dataIndex: `department_${key}`,
        title: value.comment,
      })),
    ]
      .filter(col => col.title)
      .filter(col => position[col.dataIndex] !== null)
      .filter(col => detailColumns.includes(col.dataIndex));

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
