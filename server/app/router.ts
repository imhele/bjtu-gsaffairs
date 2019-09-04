import { Application } from 'egg';

export default async (app: Application) => {
  const { controller, router } = app;
  router.post('/account/create', controller.account.create);
  router.del('/account/:accountId', controller.account.remove);
};
