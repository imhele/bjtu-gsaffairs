import { APIPrefix } from '@/global';
import requests, { RequestBody } from '@/utils/requests';

export interface LoginPayload extends RequestBody {
  account?: string;
  method: 'psw';
  psw?: string;
  timestamp?: number;
}

export async function login(payload: LoginPayload) {
  return requests<LoginPayload>(`${APIPrefix}/login`, {
    body: payload,
    method: 'POST',
  });
}

export async function fetchScope(ignoreErrcode: boolean = false) {
  return requests(`${APIPrefix}/scope`, {
    ignoreErrcode,
    method: 'POST',
  });
}
