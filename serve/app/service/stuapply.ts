import { Service } from 'egg';
import { ScopeList } from './user';
import { CellAction } from '../link';
import { DataNotFound } from '../errcode';
import { getFromIntEnum } from '../utils';
import { AuthResult } from '../extend/request';
import { FindOptions, IncludeOptions, Model, Op } from 'sequelize';
import { IntershipsWorkload } from '../model/interships/workload';
import { attr as SchoolCensusAttr, SchoolCensus as CensusModel } from '../model/school/census';
import {
  attr as StuapplyAttr,
  IntershipsStuapply as StuapplyModel,
} from '../model/interships/stuapply';
import {
  PositionType,
  attr as PositionAttr,
  Position as PositionModel,
} from '../model/interships/position';
import { getFilters } from '../controller/positionFilter';

export interface StuapplyWithFK<D extends boolean = false, S extends boolean = false>
  extends StuapplyModel {
  IntershipsPosition: D extends true ? PositionModel : never;
  SchoolCensus: S extends true ? CensusModel : never;
  [key: string]: any;
}

export interface WorkloadWithFK extends Required<IntershipsWorkload> {
  [key: string]: any;
}

export interface StuapplyWithoutPrefix {
  IntershipsStuapply: StuapplyModel;
  IntershipsPosition: PositionModel;
  SchoolCensus: CensusModel;
}

/**
 * Service of stuapply
 */
export default class StuapplyService extends Service {
  public async countApplySuccess(postId: number) {
    const { model } = this.ctx;
    const num: number = await model.Interships.Stuapply.count({
      where: {
        position_id: postId,
        ...model.Interships.Stuapply.formatBack({ audit: '申请成功' }),
      },
    });
    return num;
  }

  public async findOne<T extends boolean = false>(id: number, withoutPrefix?: T) {
    const { model } = this.ctx;
    const stuapply: any = await model.Interships.Stuapply.findByPk(id, {
      include: [model.School.Census, model.Interships.Position],
    });
    if (stuapply === null) throw new DataNotFound('申请信息不存在');
    return this.formatStuapply(stuapply, !withoutPrefix) as T extends true
      ? StuapplyWithoutPrefix
      : StuapplyWithFK;
  }

  public async updateOne(id: number, values: Partial<StuapplyModel<true>>) {
    const { model } = this.ctx;
    await model.Interships.Stuapply.update(values, {
      fields: Object.keys(values),
      where: { id },
    });
  }

  public async addOne(values: Required<StuapplyModel<true>>) {
    const { model } = this.ctx;
    delete values.id;
    await model.Interships.Stuapply.create(values);
  }

  public async deleteOne(id: number) {
    const { model } = this.ctx;
    await model.Interships.Stuapply.destroy({ where: { id } });
  }

  public async findOneWorkload(id: number) {
    const { model } = this.ctx;
    const res = await model.Interships.Workload.findByPk(id);
    if (res === null) throw new DataNotFound('申报信息不存在');
    return this.formatWorkload(res) as Required<IntershipsWorkload>;
  }

  public async findOneWorkloadForExport(workloadId: number) {
    const { model } = this.ctx;
    const workload = await model.Interships.Workload.findByPk(workloadId, {
      attributes: ['amount', 'time'],
      include: [
        {
          required: true,
          model: model.Interships.Stuapply,
          attributes: ['id'],
          include: [
            { required: true, model: model.Interships.Position, attributes: ['name'] },
            {
              required: true,
              model: model.School.Census,
              attributes: ['name', 'number'],
              include: [{ model: model.Dicts.College, attributes: ['name'], required: false }],
            },
          ],
        },
      ],
    });
    const res = (workload ? this.formatWorkload(workload) : void 0) as {
      amount: number;
      time: string;
      position_name: string;
      student_name: string;
      student_number: string;
      student_college_name: string;
    };
    return res;
  }

  public async findAndCountWorkload(
    filter: { time: string; type: number; student?: string; status: string },
    options: { limit: number; offset: number },
    extraFormatter: (item: any) => any = i => i,
  ) {
    const { model } = this.ctx;
    const dbRes = await model.Interships.Workload.findAndCountAll({
      ...options,
      attributes: ['amount', 'id'],
      where: { status: filter.status, time: filter.time },
      include: [
        {
          required: true,
          model: model.Interships.Stuapply,
          attributes: ['id'],
          include: [
            {
              required: true,
              model: model.Interships.Position,
              attributes: [
                'name',
                'department_code',
                'staff_jobnum',
                'work_time_l',
                'start_t',
                'end_t',
              ],
              where: { types: filter.type },
            },
            {
              required: true,
              model: model.School.Census,
              attributes: ['name', 'number'],
              where: filter.student
                ? {
                    [Op.or]: {
                      name: { [Op.like]: `%${filter.student}%` },
                      number: { [Op.like]: `%${filter.student}%` },
                    },
                  }
                : void 0,
            },
          ],
        },
      ],
    });
    const depMap: { title: string; value: string }[] = getFilters(['department_code'])[0]
      .selectOptions;
    return {
      total: dbRes.count,
      dataSource: dbRes.rows.map((row: any) => {
        row = this.formatWorkload(row);
        const dep = depMap.find(i => i.value === row.position_department_code);
        return extraFormatter({
          ...row,
          id: row.stuapply_id,
          workload_id: row.id,
          workload_time: filter.time,
          workload_amount: row.amount,
          workload_status: filter.status,
          position_department_code: dep && dep.title,
          time: void 0,
          amount: void 0,
          stuapply_id: void 0,
        });
      }),
    };
  }

  public async hasApplied(positionId: number, student: string) {
    const { model } = this.ctx;
    const stuapply = await model.Interships.Stuapply.findOne({
      where: { student_number: student, position_id: positionId },
    });
    return !!stuapply;
  }

  public async getTeacherAndDep({ SchoolCensus, IntershipsPosition }: StuapplyWithoutPrefix) {
    const { model } = this.ctx;
    const nameOnly = { attributes: ['name'] };
    const teacherId = SchoolCensus.teacher_code || SchoolCensus.teacher2_code;
    const dep: any = await model.Dicts.Department.findByPk(
      IntershipsPosition.department_code,
      nameOnly,
    );
    const teacher: any = await model.People.Staff.findByPk(teacherId);
    const college: any = await model.Dicts.College.findByPk(SchoolCensus.college_id, nameOnly);
    const discipline: any = await model.Discipline.Discipline.findByPk(
      SchoolCensus.discipline,
      nameOnly,
    );
    return {
      college: college ? college.get('name') : '',
      discipline: discipline ? discipline.get('name') : '',
      department_name: dep ? dep.get('name') : '',
      teacher_name: teacher ? teacher.get('name') : '',
    };
  }

  public async hasOnePassedApplication(student: string, postType: string) {
    const types = getFromIntEnum(PositionAttr, 'types', null, PositionType[postType]);
    const { model } = this.ctx;
    const stuapply = await model.Interships.Stuapply.findOne({
      attributes: ['id'],
      where: {
        student_number: student,
        ...model.Interships.Stuapply.formatBack({ audit: '申请成功' }),
      },
      include: [{ model: model.Interships.Position, where: { types }, attributes: ['types'] }],
    });
    return !!stuapply;
  }
  /**
   * 不包含 CellAction.Preview 的判断
   */
  public authorize(
    stuapply: StuapplyWithFK,
    { auditableDep, auditLink, scope, user }: AuthResult,
    type: keyof typeof PositionType,
  ) {
    const action: Map<CellAction, boolean> = new Map();
    if (scope.includes(ScopeList.admin)) {
      action.set(CellAction.Delete, true);
      action.set(CellAction.Edit, true);
      action.set(CellAction.Audit, stuapply.status === '待审核');
      /* 申请成功下可以下载协议书 */
      action.set(CellAction.File, stuapply.audit === '申请成功');
    } else {
      if (scope.includes(ScopeList.position[type].apply)) action.set(CellAction.Apply, true);
      /* 用户可以访问和删除自己发布的岗位 */
      if (stuapply.student_number === user.loginname) {
        action.set(CellAction.Delete, true);
        /* 草稿状态下可以编辑 */
        action.set(CellAction.Edit, stuapply.status === '草稿');
        /* 申请成功下可以下载协议书 */
        action.set(CellAction.File, stuapply.audit === '申请成功');
      }
      /* 根据岗位审核进度设定审核权限可用状态 */
      if (auditableDep.includes(stuapply.position_department_code!)) {
        /* 申请成功下可以下载协议书 */
        action.set(CellAction.File, stuapply.audit === '申请成功');
        action.set(
          CellAction.Audit,
          stuapply.audit === '用人单位审核' && stuapply.status === '待审核',
        );
      }
      if (auditLink.includes(stuapply.audit)) {
        /* 申请成功下可以下载协议书 */
        action.set(CellAction.File, stuapply.audit === '申请成功');
        action.set(CellAction.Audit, stuapply.status === '待审核');
      }
      if (
        stuapply.student_teacher_code === user.loginname ||
        stuapply.student_teacher2_code === user.loginname
      ) {
        /* 申请成功下可以下载协议书 */
        action.set(CellAction.File, stuapply.audit === '申请成功');
        action.set(CellAction.Audit, stuapply.audit === '导师确认' && stuapply.status === '待审核');
      }
    }
    return action;
  }

  /**
   * 无前缀版
   */
  public authorizeWithoutPrefix(
    stuapply: StuapplyWithoutPrefix,
    { auditableDep, auditLink, scope, user }: AuthResult,
    type: keyof typeof PositionType,
  ) {
    const action: Map<CellAction, boolean> = new Map();
    if (scope.includes(ScopeList.admin)) {
      action.set(CellAction.Delete, true);
      action.set(CellAction.Edit, true);
      action.set(CellAction.Audit, stuapply.IntershipsStuapply.status === '待审核');
      /* 申请成功下可以下载协议书 */
      action.set(CellAction.File, stuapply.IntershipsStuapply.audit === '申请成功');
    } else {
      if (scope.includes(ScopeList.position[type].apply)) action.set(CellAction.Apply, true);
      /* 用户可以访问和删除自己发布的岗位 */
      if (stuapply.IntershipsStuapply.student_number === user.loginname) {
        action.set(CellAction.Delete, true);
        /* 草稿状态下可以编辑 */
        action.set(CellAction.Edit, stuapply.IntershipsStuapply.status === '草稿');
        /* 申请成功下可以下载协议书 */
        action.set(CellAction.File, stuapply.IntershipsStuapply.audit === '申请成功');
      }
      /* 根据岗位审核进度设定审核权限可用状态 */
      if (auditableDep.includes(stuapply.IntershipsPosition.department_code!)) {
        /* 申请成功下可以下载协议书 */
        action.set(CellAction.File, stuapply.IntershipsStuapply.audit === '申请成功');
        action.set(
          CellAction.Audit,
          stuapply.IntershipsStuapply.audit === '用人单位审核' &&
            stuapply.IntershipsStuapply.status === '待审核',
        );
      }
      if (auditLink.includes(stuapply.IntershipsStuapply.audit)) {
        /* 申请成功下可以下载协议书 */
        action.set(CellAction.File, stuapply.IntershipsStuapply.audit === '申请成功');
        action.set(CellAction.Audit, stuapply.IntershipsStuapply.status === '待审核');
      }
      if (
        stuapply.SchoolCensus.teacher_code === user.loginname ||
        stuapply.SchoolCensus.teacher2_code === user.loginname
      ) {
        /* 申请成功下可以下载协议书 */
        action.set(CellAction.File, stuapply.IntershipsStuapply.audit === '申请成功');
        action.set(
          CellAction.Audit,
          stuapply.IntershipsStuapply.audit === '导师确认' &&
            stuapply.IntershipsStuapply.status === '待审核',
        );
      }
    }
    return action;
  }

  public async findAndCountAll<P extends boolean = true, TCustomAttributes = {}>(
    options: FindOptions<StuapplyModel<true> & TCustomAttributes>,
    include?: Array<Model<any, any> | IncludeOptions>,
    toPrefix: boolean = true,
    formatLog: boolean = true,
  ) {
    const { model } = this.ctx;
    const result = await model.Interships.Stuapply.findAndCountAll({ ...options, include });
    return {
      applications: result.rows.map((item: any) =>
        this.formatStuapply(item, toPrefix, formatLog),
      ) as (P extends true ? StuapplyWithFK : StuapplyWithoutPrefix)[],
      total: result.count,
    };
  }

  public getColumnsObj(toPrefix: boolean = true) {
    let columnsObj: { [key: string]: object } = {};
    Object.entries(StuapplyAttr).forEach(([dataIndex, value]: any) => {
      columnsObj[dataIndex] = { dataIndex, title: value.comment };
      if (dataIndex === 'audit_log')
        Object.assign(columnsObj[dataIndex], { editDisabled: true, sm: 24, md: 24 });
      else if (dataIndex === 'status' || dataIndex === 'audit')
        Object.assign(columnsObj[dataIndex], { editDisabled: true });
    });
    if (toPrefix) {
      Object.entries(PositionAttr).forEach(([dataIndex, value]: any) => {
        dataIndex = `position_${dataIndex}`;
        columnsObj[dataIndex] = { dataIndex, title: value.comment };
      });
      Object.entries(SchoolCensusAttr).forEach(([dataIndex, value]: any) => {
        dataIndex = `student_${dataIndex}`;
        columnsObj[dataIndex] = { dataIndex, title: value.comment };
      });
    } else {
      columnsObj = { IntershipsStuapply: columnsObj };
      Object.assign(columnsObj, { SchoolCensus: {}, IntershipsPosition: {} });
      Object.entries(PositionAttr).forEach(([dataIndex, value]: any) => {
        columnsObj.IntershipsPosition[dataIndex] = { dataIndex, title: value.comment };
      });
      Object.entries(SchoolCensusAttr).forEach(([dataIndex, value]: any) => {
        columnsObj.SchoolCensus[dataIndex] = { dataIndex, title: value.comment };
      });
    }
    return columnsObj;
  }

  private formatWorkload(workload: any) {
    const formatted = workload.get();
    if (formatted.IntershipsStuapply) {
      formatted.IntershipsStuapply = formatted.IntershipsStuapply.get();
      if (formatted.IntershipsStuapply.SchoolCensu) {
        formatted.IntershipsStuapply.SchoolCensus = formatted.IntershipsStuapply.SchoolCensu;
        delete formatted.IntershipsStuapply.SchoolCensu;
      }

      if (formatted.IntershipsStuapply.IntershipsPosition) {
        const post = formatted.IntershipsStuapply.IntershipsPosition.get();
        Object.entries(post).forEach(([key, value]) => {
          formatted[`position_${key}`] = value;
        });
        delete formatted.IntershipsStuapply.IntershipsPosition;
      }
      if (formatted.IntershipsStuapply.SchoolCensus) {
        const census = formatted.IntershipsStuapply.SchoolCensus.get();
        if (census.DictsCollege) {
          const college = census.DictsCollege.get();
          Object.entries(college).forEach(([key, value]) => {
            formatted[`student_college_${key}`] = value;
          });
          delete census.DictsCollege;
        }
        Object.entries(census).forEach(([key, value]) => {
          formatted[`student_${key}`] = value;
        });
        delete formatted.IntershipsStuapply.SchoolCensus;
      }
      Object.entries(formatted.IntershipsStuapply).forEach(([key, value]) => {
        formatted[`stuapply_${key}`] = value;
      });
      delete formatted.IntershipsStuapply;
    }
    return formatted as any;
  }

  private formatStuapply(stuapply: any, toPrefix: boolean = true, formatLog: boolean = false) {
    const formatted = stuapply.format();
    if (formatLog && formatted.audit_log)
      formatted.audit_log = this.service.position.formatAuditLog(formatted.audit_log);
    if (formatted.SchoolCensu) {
      formatted.SchoolCensus = formatted.SchoolCensu;
      delete formatted.SchoolCensu;
    }
    if (formatted.IntershipsPosition) {
      formatted.IntershipsPosition = formatted.IntershipsPosition.format();
      const { audit_log } = formatted.IntershipsPosition;
      if (formatLog && audit_log)
        formatted.IntershipsPosition.audit_log = this.service.position.formatAuditLog(audit_log);
      if (toPrefix) {
        Object.entries(formatted.IntershipsPosition).forEach(([key, value]) => {
          formatted[`position_${key}`] = value;
        });
        delete formatted.IntershipsPosition;
      }
    }
    if (formatted.SchoolCensus) {
      formatted.SchoolCensus = formatted.SchoolCensus.format();
      if (toPrefix) {
        Object.entries(formatted.SchoolCensus).forEach(([key, value]) => {
          formatted[`student_${key}`] = value;
        });
        delete formatted.SchoolCensus;
      }
    }
    if (!toPrefix) {
      const res = {
        IntershipsStuapply: formatted,
        SchoolCensus: formatted.SchoolCensus,
        IntershipsPosition: formatted.IntershipsPosition,
      };
      delete res.IntershipsStuapply.SchoolCensus;
      delete res.IntershipsStuapply.IntershipsPosition;
      return res;
    }
    return formatted as any;
  }
}
