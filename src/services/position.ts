import { APIPrefix } from '@/global';
import { stringify } from 'querystring';
import { PositionType } from '@/pages/Position/consts';
import requests, { RequestBody } from '@/utils/requests';

interface FetchQuery {
  type: PositionType;
}

interface FetchListBody extends RequestBody {
  filtersValue?: object;
  limit?: number;
  offset?: number;
}

export interface FetchListPayload {
  body: FetchListBody;
  query: FetchQuery;
}

export async function fetchList(payload: FetchListPayload) {
  return requests<FetchListBody>(`${APIPrefix}/position/list?${stringify(payload.query)}`, {
    body: payload.body,
    method: 'POST',
  });
}

interface FetchDetailBody extends RequestBody {
  key: string | number;
}

export interface FetchDetailPayload {
  body: FetchDetailBody;
  query: FetchQuery;
}

export async function fetchDetail(payload: FetchDetailPayload) {
  return requests<FetchDetailBody>(`${APIPrefix}/position/detail?${stringify(payload.query)}`, {
    body: payload.body,
    method: 'POST',
  });
}

interface DeletePositionBody extends RequestBody {
  key: string | number;
}

export interface DeletePositionPayload {
  body: DeletePositionBody;
  query: FetchQuery;
}

export async function deletePosition(payload: DeletePositionPayload) {
  return requests<DeletePositionBody>(`${APIPrefix}/position/delete?${stringify(payload.query)}`, {
    body: payload.body,
    method: 'POST',
  });
}
