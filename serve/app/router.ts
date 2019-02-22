import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;

  router.post('/login', controller.user.login);
  router.post('/scope', controller.user.scope);

  router.post('/position/:type/form', controller.position.form);
  router.post('/position/:type/list', controller.position.list);
  router.post('/position/:type/detail', controller.position.detail);
  router.post('/position/:type/create', controller.position.create);
  router.post('/position/:type/delete', controller.position.delete);
  router.post('/position/:type/edit', controller.position.edit);
};
