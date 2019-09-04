import { HashType, makeHash } from '@/utils';
import { AuthError } from '@/utils/errorcode';
import { Context } from 'egg';
import yamlJoi from 'yaml-joi';

const ActAuthSupportHash: HashType[] = [
  'MD5',
  'SHA1',
  'SHA256',
  'SHA512',
  'MD5-HMAC',
  'SHA1-HMAC',
  'SHA256-HMAC',
  'SHA512-HMAC',
];

const ActAuthHeaderSchema = yamlJoi(`
type: array
isSchema: true
limitation:
  - ordered:
      type: string
      isSchema: true
      limitation:
        - uppercase: true
        - valid: [${ActAuthSupportHash.join(', ')}]
  - ordered:
      type: string
      isSchema: true
      limitation:
        - length: 18
        - regex: !!js/regexp /^(?:[0-9a-zA-Z]*)$/
  - ordered:
      type: number
      isSchema: true
      limitation:
        - min: 1000000000
        - max: 9999999999
        - integer: []
  - ordered:
      type: string
      isSchema: true
`);

async function ActAuthV1(ctx: Context) {
  const headerStr = ctx.request.get('Authorization').split('_');
  const { error, value } = ActAuthHeaderSchema.validate(headerStr);
  // validate header failed
  if (error) throw new AuthError('authentication failed, please ensure the token is valid');
  const [hashType, accountId, expiryTime, signature] = value as [HashType, string, number, string];
  // validate expiry time
  if (expiryTime < Date.now() / 1000) throw new AuthError('token has expired');
  const account = await ctx.service.account.findOne(accountId);
  // non-existent account
  if (!account) throw new AuthError('account incorrect or non-existent');
  const reSignRes = makeHash(hashType, account.id, `${account.password}${expiryTime}`);
  // signature does not match
  if (signature !== reSignRes) throw new AuthError('invalid token');
  return account;
}

export default () => {
  return async function auth(ctx: Context, next: () => Promise<any>) {
    ctx.request.account = await ActAuthV1(ctx);
    await next();
  };
};
