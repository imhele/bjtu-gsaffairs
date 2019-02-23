import { Service } from 'egg';
import { DataNotFound } from '../errcode';
import { SchoolCensus as CensusModel } from '../model/school/census';
import { Position as PositionModel } from '../model/interships/position';
import { IntershipsStuapply as StuapplyModel } from '../model/interships/stuapply';

export interface StuapplyWithFK<D extends boolean = false, S extends boolean = false>
  extends StuapplyModel {
  IntershipsPosition: D extends true ? PositionModel : never;
  SchoolCensus: S extends true ? CensusModel : never;
  [key: string]: any;
}

/**
 * Service of stuapply
 */
export default class StuapplyService extends Service {
  public async findOne(id: number): Promise<StuapplyWithFK> {
    const { model } = this.ctx;
    const stuapply: any = await model.Interships.Stuapply.findByPk(id, {
      include: [model.School.Census, model.Interships.Position],
    });
    if (stuapply === null) throw new DataNotFound('申请信息不存在');
    return this.formatStuapply(stuapply) as StuapplyWithFK;
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

  private formatStuapply(stuapply: any) {
    const formatted = stuapply.format();
    if (formatted.IntershipsPosition) {
      formatted.IntershipsPosition = formatted.IntershipsPosition.format();
      Object.entries(formatted.IntershipsPosition).forEach(([key, value]) => {
        formatted[`position_${key}`] = value;
      });
      delete formatted.IntershipsPosition;
    }
    if (formatted.SchoolCensus) {
      formatted.SchoolCensus = formatted.SchoolCensus.format();
      Object.entries(formatted.SchoolCensus).forEach(([key, value]) => {
        formatted[`student_${key}`] = value;
      });
      delete formatted.SchoolCensus;
    }
    return formatted as any;
  }
}
