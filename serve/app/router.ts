import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;

  router.post('/login', controller.user.login);
  router.post('/scope', controller.user.scope);

  router.get('/position/:type/list', controller.position.list)
};
