import { Service } from 'egg';
import { Op } from 'sequelize';
import { DataNotFound } from '../errcode';
import { getFromIntEnum } from '../utils';
import { SimpleFormItemType } from '../link';
import { AuthResult } from '../extend/request';
import { attr as PositionAttr } from '../model/interships/position';

export default class TeachingService extends Service {
  public getTeachingTaskFormItem() {
    return {
      id: 'task_teaching_id',
      itemProps: { placeholder: '输入课程号或课程名以查询课程' },
      title: '助教课程',
      type: SimpleFormItemType.Select,
    };
  }

  public async getTeachingTaskInfo(taskId: number, auth: AuthResult) {
    const { model } = this.ctx;
    const tasks: any[] = await model.Task.Teacher.findAll({
      where: { task_teaching_id: taskId },
      include: [model.Task.Teaching],
    });
    const task: any =
      tasks.find(item => item.get('jsh') === auth.user.loginname) || tasks[0] || null;
    if (task === null) throw new DataNotFound('找不到课程，请重新选择');
    const teacher: any = await model.People.Staff.findByPk(task.get('jsh'));
    return {
      name: `${task.get().TaskTeaching.get('kcm')} - ${teacher.get('name')}`,
      jsh: task.get('jsh'),
      dep: task.get().TaskTeaching.get('department_code'),
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
      .map(({ id, kch, kxh, kcm, student_type: s }) => ({
        value: id,
        title: `[${s.slice(0, 3)}] ${kch} [${kxh}] ${kcm}`,
      }));
  }

  public getTeachingTaskFormItemByPosition(position: { [key: string]: any }) {
    return {
      id: 'task_teaching_id',
      itemProps: { placeholder: '输入课程号或课程名以查询课程' },
      title: '助教课程',
      type: SimpleFormItemType.Select,
      selectOptions: [
        {
          value: position.teaching_id,
          title: `[${position.teaching_student_type.slice(0, 3)}] ${position.teaching_kch} [${
            position.teaching_kxh
          }] ${position.teaching_kcm}`,
        },
      ],
    };
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
