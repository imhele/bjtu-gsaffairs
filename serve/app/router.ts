import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;

  router.post('/api/login', controller.user.login);
  router.post('/api/scope', controller.user.scope);

  router.post('/api/position/:type/list', controller.position.list);
  router.post('/api/position/:type/detail/:id', controller.position.detail);
  router.post('/api/position/:type/form/:id?', controller.position.form);
  router.post('/api/position/:type/create', controller.position.create);
  router.post('/api/position/:type/delete/:id', controller.position.delete);
  router.post('/api/position/:type/audit/:id', controller.position.audit);
  router.post('/api/position/:type/edit/:id', controller.position.edit);
  router.post('/api/position/task/:search?', controller.position.getTeachingTask);

  router.post('/api/stuapply/:type/list', controller.stuapply.list);
  router.post('/api/stuapply/:type/form/:id', controller.stuapply.form);
  router.post('/api/stuapply/:type/create/:id', controller.stuapply.create);
  router.post('/api/stuapply/:type/delete/:id', controller.stuapply.delete);
  router.post('/api/stuapply/:type/audit/:id', controller.stuapply.audit);
  router.post('/api/stuapply/:type/edit/:id', controller.stuapply.edit);

  router.post('/api/admin/client/:type/list/:search?', controller.admin.clientList);
  router.post('/api/admin/client/:type/create', controller.admin.clientCreate);
  router.post('/api/admin/client/:type/delete/:id', controller.admin.clientDelete);
  router.post('/api/admin/client/:type/edit/:id', controller.admin.clientEdit);
  router.post('/api/admin/time/:action', controller.admin.timeConfig);
};
