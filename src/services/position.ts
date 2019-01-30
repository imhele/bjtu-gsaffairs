import { APIPrefix } from '@/global';
import { PositionType } from '@/pages/Position/consts';
import requests, { RequestBody } from '@/utils/requests';

export interface FetchListBody extends RequestBody {
  filtersValue?: object;
  limit?: number;
  offset?: number;
  type: PositionType;
}

export async function fetchList(body: FetchListBody) {
  return requests<FetchListBody>(`${APIPrefix}/position/list`, {
    body,
    method: 'POST',
  });
}
