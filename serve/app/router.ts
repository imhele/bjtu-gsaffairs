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

  router.post('/api/stuapply/:type/form/:id', controller.stuapply.form);
};
