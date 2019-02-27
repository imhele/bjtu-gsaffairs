import { APIPrefix } from '@/global';
import { FetchQuery } from './position';
import requests, { RequestBody } from '@/utils/requests';

export interface FetchListBody extends RequestBody {
  limit?: number;
  offset?: number;
  status?: string;
}

export interface FetchListPayload {
  body: FetchListBody;
  query: FetchQuery;
}

export async function fetchList(payload: FetchListPayload) {
  return requests<FetchListBody>(`${APIPrefix}/stuapply/${payload.query.type}/list`, {
    body: payload.body,
    method: 'POST',
  });
}

export interface DeleteStuapplyPayload {
  query: FetchQuery;
}

export async function deleteStuapply({ query }: DeleteStuapplyPayload) {
  return requests(`${APIPrefix}/stuapply/${query.type}/delete/${query.key}`, {
    method: 'POST',
  });
}

export interface EditStuapplyBody extends RequestBody {
  [key: string]: any;
}

export interface EditStuapplyPayload {
  body: EditStuapplyBody;
  query: FetchQuery;
}

export async function editStuapply({ body, query }: EditStuapplyPayload) {
  return requests<EditStuapplyBody>(`${APIPrefix}/stuapply/${query.type}/edit/${query.key}`, {
    body,
    method: 'POST',
  });
}

export interface AuditStuapplyBody extends RequestBody {
  [key: string]: any;
}

export interface AuditStuapplyPayload {
  body: AuditStuapplyBody;
  query: FetchQuery;
}

export async function auditStuapply({ body, query }: AuditStuapplyPayload) {
  return requests<AuditStuapplyBody>(`${APIPrefix}/stuapply/${query.type}/audit/${query.key}`, {
    body,
    method: 'POST',
  });
}
