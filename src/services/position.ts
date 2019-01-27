import { APIPrefix } from '@/global';
import requests, { RequestBody } from '@/utils/requests';

export interface FetchListBody extends RequestBody {
  filtersValue?: object;
  limit?: number;
  offset?: number;
  type: 'manage' | 'teach';
}

export async function fetchList(body: FetchListBody) {
  return requests<FetchListBody>(`${APIPrefix}/position/list`, {
    body,
    method: 'POST',
  });
}
