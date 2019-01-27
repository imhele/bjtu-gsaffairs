import exception from './zh-CN/exception';
import position from './zh-CN/position';
import user from './zh-CN/user';
import words from './zh-CN/words';

export default {
  'app.name': '研究生三助系统',
  'app.mis': '校园管理信息系统',
  'app.slogan': '用体验科技让社会变好一点点',
  'app.position': '岗位信息',
  'app.position.manage': '助管岗位',
  'app.position.teach': '助教岗位',
  ...exception,
  ...position,
  ...user,
  ...words,
};
