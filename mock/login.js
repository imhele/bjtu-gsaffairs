export const APIPrefix = '/api';

const scope = (req, res) => {
  const { method = '', account = '', psw = '', timestamp = 0 } = req.body || {};
  if (!['psw', 'token'].includes(method)) {
    return res.send({
      errcode: 40010,
      errmsg: 'Invalid login method',
    });
  }
  const result = {
    scope: [
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
    ],
    redirect: '/position/manage/list',
    token: 'abcdefg',
    userName: 'User',
  };
  if (method === 'token') {
    if (req.headers['Authorization'] !== 'abcdef')
      return res.send({
        errcode: 40011,
        errmsg: 'Invalid token',
      });
    delete result.redirect;
  } else {
    if (timestamp < Date.now() / 1000)
      return res.send({
        errcode: 40012,
        errmsg: 'Expired signature',
      });
  }
  res.send(result);
};

export default {
  [`POST ${APIPrefix}/scope`]: scope,
};
