import 'mocha';
import 'tsconfig-paths/register';

import { ErrCode, promisifyTestReq } from '@/utils';
import assert from 'assert';
import { app } from 'egg-mock/bootstrap';
import yaml from 'js-yaml';

describe('test controller.account', () => {
  beforeEach(async () => {
    /** ensure extend.application works */
    await app.hook.onAppReady.wait(app);
  });

  it('test controller.account', async () => {
    /** start test methods */
    const accountId = await app
      .httpRequest()
      .post(`/account/create`)
      .set('X-Body-Format', 'json')
      .then((res: any) => {
        assert('secret' in res.body);
        assert('accountId' in res.body);
        assert.strictEqual(typeof res.body.secret, 'string');
        assert.strictEqual(typeof res.body.accountId, 'string');
        return res.body.accountId;
      });
    await app
      .httpRequest()
      .del(`/account/${accountId}`)
      .then((res: any) => {
        assert.strictEqual(yaml.safeLoad(res.text), ErrCode.Succeed);
      });
    await promisifyTestReq(
      app
        .httpRequest()
        .del(`/account/abc`)
        .expect('X-Error-Code', ErrCode.InvalidParam),
    );
  });
});
