/**
 * Carry `ActAuth` signature in headers
 *
 * @return {object} Request headers
 */
export function getSign(): object {
  const actAuth: string | null = localStorage.getItem('actAuth');
  if (actAuth === null) { return ({}); }
  return ({ 'Act-Auth-Token': actAuth });
}

export function setSign(sign: string | null): void {
  try {
    localStorage.setItem('actAuth', sign);
  } catch (err) { console.warn(err); }
}

export function getExpiresIn(): number {
  const actAuth: string | null = localStorage.getItem('actAuth');
  if (actAuth === null) return 0;
  try {
    const expiryTime: number = parseInt(actAuth.split(' ')[0], 10);
    const expiresIn = expiryTime - Date.now() / 1000;
    if (Number.isNaN(expiresIn)) return 0;
    else return expiresIn;
  } catch (err) { return 0; }
}

export function isExpired(): boolean {
  return getExpiresIn() <= 3;
}
