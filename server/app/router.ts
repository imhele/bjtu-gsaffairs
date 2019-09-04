import { Application } from 'egg';

export default async (app: Application) => {
  const { controller, router } = app;
  router.get('  /api/account              '.trim(), controller.account.list);
  router.post(' /api/account              '.trim(), controller.account.create);
  router.post(' /api/account/bulk-upsert  '.trim(), controller.account.bulkUpsert);
  router.del('  /api/account/:accountId   '.trim(), controller.account.remove);
  router.get('  /api/account/:accountId   '.trim(), controller.account.findOne);
  router.put('  /api/account/:accountId   '.trim(), controller.account.update);
};
