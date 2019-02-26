import { Service } from 'egg';
import { SimpleFormItemType } from '../link';

export default class TeachingService extends Service {
  public async getTeachingTaskSelection() {
    const { model } = this.ctx;
    const tasks = await model.Task.Teaching.findAll();
    return {
      id: 'task_teaching_id',
      decoratorOptions: { rules: [{ required: true, message: '必填项' }] },
      type: SimpleFormItemType.Select,
      title: '助教课程',
      selectOptions: tasks
        .map((item: any) => item.format())
        .map(item => ({ value: item.id, title: `${item.kch} [${item.kxh}] ${item.kcm}` })),
    };
  }
}
