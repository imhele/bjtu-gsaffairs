import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;

  router.post('/login', controller.user.login);
  router.post('/scope', controller.user.scope);

  router.post('/position/:type/list', controller.position.list);
  router.post('/position/:type/detail/:id', controller.position.detail);
  router.post('/position/:type/form/:id?', controller.position.form);
  router.post('/position/:type/create', controller.position.create);
  router.post('/position/:type/delete/:id', controller.position.delete);
  router.post('/position/:type/audit/:id', controller.position.audit);
  router.post('/position/:type/edit/:id', controller.position.edit);
};
