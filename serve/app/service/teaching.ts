import { Service } from 'egg';
import { Op } from 'sequelize';
import { SimpleFormItemType } from '../link';

export default class TeachingService extends Service {
  public getTeachingTaskFormItem() {
    return {
      id: 'task_teaching_id',
      decoratorOptions: { rules: [{ required: true, message: '必填项' }] },
      selectOptions: [],
      title: '助教课程',
      type: SimpleFormItemType.Select,
    };
  }

  public async getTeachingTaskSelection(search: string, teacher?: string) {
    const { model } = this.ctx;
    search = { [Op.like]: `%${search}%` } as any;
    const where = { [Op.or]: [{ kch: search }, { kcm: search }] };
    if (teacher) Object.assign(where, { jsh: teacher });
    const tasks = await model.Task.Teacher.findAll({
      limit: 20,
      attributes: ['jsh'],
      include: [{ model: model.Task.Teaching, where }],
    });
    return tasks
      .map((item: any) => item.get().TaskTeaching.format())
      .map(item => ({ value: item.id, title: `${item.kch} [${item.kxh}] ${item.kcm}` }));
  }
}
