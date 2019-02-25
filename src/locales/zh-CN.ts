import exception from './zh-CN/exception';
import login from './zh-CN/login';
import position from './zh-CN/position';
import route from './zh-CN/route';
import stuapply from './zh-CN/stuapply';
import tip from './zh-CN/tip';
import user from './zh-CN/user';
import word from './zh-CN/word';

export default {
  'app.developer': '北京交通大学信息化办公室',
  'app.mis': '校园管理信息系统',
  'app.name': '研究生三助系统',
  'app.slogan': '用体验科技让社会变好一点点',
  ...exception,
  ...login,
  ...position,
  ...route,
  ...stuapply,
  ...tip,
  ...user,
  ...word,
};
