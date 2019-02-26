import { Application } from 'egg';
import { setModelInstanceMethods } from '../../utils';
import { DefineModelAttributes, STRING } from 'sequelize';

export interface TaskTeacher {
  task_teaching_id?: number;
  jsh: string;
}

export const attr: DefineModelAttributes<TaskTeacher> = {
  jsh: {
    allowNull: false,
    comment: '授课教师',
    type: STRING(15),
    validate: { len: [0, 15], notEmpty: true },
  },
};

export default (app: Application) => {
  const Model = app.model.define('TaskTeacher', attr, {
    tableName: 'task_teacher',
  });
  Model.associate = () => {
    app.model.Task.Teacher.belongsTo(app.model.Task.Teaching, {
      foreignKey: 'task_teaching_id',
    });
  };
  return setModelInstanceMethods(Model, attr);
};
