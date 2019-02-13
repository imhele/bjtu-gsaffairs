import { APIPrefix } from '@/global';
import requests, { RequestBody } from '@/utils/requests';

export interface FetchScopePayload extends RequestBody {
  method: 'psw' | 'token';
  psw?: string;
  timestamp?: number;
  userName?: string;
}

export async function fetchScope(payload: FetchScopePayload) {
  return requests<FetchScopePayload>(`${APIPrefix}/scope`, {
    body: payload,
    method: 'POST',
  });
}
