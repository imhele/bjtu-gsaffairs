import { APIPrefix } from '@/global';
import requests, { RequestBody } from '@/utils/requests';
import { CellAction, PositionType, TopbarAction } from '@/pages/Position/consts';

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
  return requests<FetchListBody>(`${APIPrefix}/position/${payload.query.type}/list`, {
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
  return requests<FetchDetailBody>(`${APIPrefix}/position/${payload.query.type}/detail`, {
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
  return requests<DeletePositionBody>(`${APIPrefix}/position/${payload.query.type}/delete`, {
    body: payload.body,
    method: 'POST',
  });
}

interface FetchFormBody extends RequestBody {
  action: CellAction | TopbarAction;
  key?: string | number;
}

export interface FetchFormPayload {
  body: FetchFormBody;
  query: FetchQuery;
}

export async function fetchForm(payload: FetchFormPayload) {
  return requests<FetchFormBody>(`${APIPrefix}/position/${payload.query.type}/form`, {
    body: payload.body,
    method: 'POST',
  });
}

interface CreatePositionBody extends RequestBody {
  [key: string]: any;
}

export interface CreatePositionPayload {
  body: CreatePositionBody;
  query: FetchQuery;
}

export async function createPosition(payload: CreatePositionPayload) {
  return requests<CreatePositionBody>(`${APIPrefix}/position/${payload.query.type}/create`, {
    body: payload.body,
    method: 'POST',
  });
}

interface EditPositionBody extends RequestBody {
  key: string | number;
  [key: string]: any;
}

export interface EditPositionPayload {
  body: EditPositionBody;
  query: FetchQuery;
}

export async function editPosition(payload: EditPositionPayload) {
  return requests<EditPositionBody>(`${APIPrefix}/position/${payload.query.type}/edit`, {
    body: payload.body,
    method: 'POST',
  });
}

interface AuditPositionBody extends RequestBody {
  key: string | number;
  [key: string]: any;
}

export interface AuditPositionPayload {
  body: AuditPositionBody;
  query: FetchQuery;
}

export async function auditPosition(payload: AuditPositionPayload) {
  return requests<AuditPositionBody>(`${APIPrefix}/position/${payload.query.type}/audit`, {
    body: payload.body,
    method: 'POST',
  });
}
