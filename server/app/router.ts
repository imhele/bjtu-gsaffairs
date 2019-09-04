import { Application } from 'egg';

export default async (app: Application) => {
  const { controller, router } = app;
  router.get('/account', controller.account.list);
  router.post('/account', controller.account.create);
  router.post('/account/bulk-upsert', controller.account.bulkUpsert);
  router.del('/account/:accountId', controller.account.remove);
  router.get('/account/:accountId', controller.account.findOne);
  router.put('/account/:accountId', controller.account.update);
};
