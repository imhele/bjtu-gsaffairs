import { APIPrefix } from '@/global';
import requests, { RequestBody } from '@/utils/requests';

export interface FetchListBody extends RequestBody {
  limit?: number;
  offset?: number;
  type?: string;
}

export interface FetchListPayload {
  body: FetchListBody;
}

export async function fetchList(payload: FetchListPayload) {
  return requests<FetchListBody>(`${APIPrefix}/stuapply/workload/list`, {
    body: payload.body,
    method: 'POST',
  });
}
