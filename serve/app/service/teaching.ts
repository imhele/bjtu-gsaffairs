import { Service } from 'egg';
import { Op } from 'sequelize';
import { getFromIntEnum } from '../utils';
import { SimpleFormItemType } from '../link';
import { attr as PositionAttr } from '../model/interships/position';

export default class TeachingService extends Service {
  public getTeachingTaskFormItem() {
    return {
      id: 'task_teaching_id',
      decoratorOptions: { rules: [{ required: true, message: '必填项' }] },
      itemProps: { placeholder: '输入课程号或课程名以查询课程' },
      title: '助教课程',
      type: SimpleFormItemType.Select,
    };
  }

  public async getTeachingTaskSelection(search: string, teacher?: string) {
    const { model } = this.ctx;
    search = { [Op.like]: `%${search}%` } as any;
    const where = { [Op.or]: [{ kch: search }, { kcm: search }] };
    const tasks = await model.Task.Teacher.findAll({
      limit: 20,
      attributes: ['jsh'],
      where: teacher && { jsh: teacher },
      include: [{ model: model.Task.Teaching, where }],
    });
    return tasks
      .map((item: any) => item.get().TaskTeaching.format())
      .map(item => ({ value: item.id, title: `${item.kch} [${item.kxh}] ${item.kcm}` }));
  }

  public async hasCreatedPosition(teachingTaskId: number) {
    const { model } = this.ctx;
    const position = await model.Interships.Position.findAll({
      where: {
        task_teaching_id: teachingTaskId,
        status: { [Op.not]: getFromIntEnum(PositionAttr, 'status', null, '废除') },
      },
    });
    return position.length ? true : false;
  }
}