import hash from 'hash.js';

export const APIPrefix = process.env.SERVE ? '/bjtu-papms/api' : '/api';

const sha = (content, secret) => {
  return hash
    .hmac(hash.sha256, secret)
    .update(content)
    .digest('hex');
};

const login = (req, res) => {
  const { method = '', account = '', psw = '', timestamp = 0 } = req.body || {};
  if (!['psw'].includes(method)) {
    return res.send({
      errcode: 40010,
      errmsg: 'Invalid login method',
    });
  }
  if (timestamp + 60 < Date.now() / 1000)
    return res.send({
      errcode: 40011,
      errmsg: 'Expired signature',
    });
  const result = {
    redirect: '/position/manage/list',
    token: 'user',
  };
  switch (account) {
    case 'admin':
      if (psw === sha(`${timestamp}${account}`, 'admin')) result.token = 'admin';
      break;
    case 'teacher':
      if (psw === sha(`${timestamp}${account}`, 'teacher')) result.token = 'teacher';
      break;
    case 'department':
      if (psw === sha(`${timestamp}${account}`, 'department')) result.token = 'department';
      break;
    default:
      return res.send({ errcode: 40012, errmsg: '账户名或密码不正确' });
  }
  res.send(result);
};

const scope = (req, res) => {
  const Authorization = req.headers.authorization || req.headers.Authorization;
  const result = {
    scope: {
      include: [],
      exclude: [],
    },
    username: 'User',
  };
  if (!['admin', 'teacher', 'department'].includes(Authorization))
    return res.send({
      errcode: 40011,
      errmsg: 'Invalid token',
    });
  switch (Authorization) {
    case 'admin':
      result.username = 'Admin';
      result.scope.include = ['scope.admin'];
      break;
    case 'teacher':
      result.username = 'Teacher';
      result.scope.include = [
        'scope.position.manage.list',
        'scope.position.manage.create',
        'scope.position.manage.edit',
        'scope.position.teach.list',
        'scope.position.teach.create',
        'scope.position.teach.edit',
      ];
      break;
    case 'department':
      result.username = 'Department';
      result.scope.include = [
        'scope.position.manage.list',
        'scope.position.manage.create',
        'scope.position.manage.edit',
        'scope.position.manage.export',
        'scope.position.manage.audit',
        'scope.position.teach.list',
        'scope.position.teach.create',
        'scope.position.teach.edit',
        'scope.position.teach.export',
        'scope.position.teach.audit',
      ];
      break;
    default:
      return res.send({ errcode: 40013, errmsg: '令牌已过期，请重新登录' });
  }
  setTimeout(() => res.send(result), 400);
};

export default {
  [`POST ${APIPrefix}/login`]: login,
  [`POST ${APIPrefix}/scope`]: scope,
};
