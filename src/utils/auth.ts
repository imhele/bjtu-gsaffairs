import hash from 'hash.js';

export const setSign = (token: string | null) => {
  localStorage.setItem('token', token);
};

export const getSign = (): object => {
  const token: string = localStorage.getItem('token') || '';
  return {
    Authorization: token,
  };
};

export const hmacSha256 = (content: string, secret: string): string => {
  return hash
    .hmac(hash.sha256 as any, secret)
    .update(content)
    .digest('hex');
};
