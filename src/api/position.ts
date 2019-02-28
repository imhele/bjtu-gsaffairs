import { APIPrefix } from '@/global';
import requests, { RequestBody } from '@/utils/requests';
import { CellAction, PositionType, TopbarAction } from '@/pages/Position/consts';

export interface FetchQuery {
  type: PositionType;
  key?: string | number;
}

export interface FetchListBody extends RequestBody {
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

export interface FetchDetailPayload {
  query: FetchQuery;
}

export async function fetchDetail({ query }: FetchDetailPayload) {
  return requests(`${APIPrefix}/position/${query.type}/detail/${query.key}`, {
    method: 'POST',
  });
}

export interface DeletePositionPayload {
  query: FetchQuery;
}

export async function deletePosition({ query }: DeletePositionPayload) {
  return requests(`${APIPrefix}/position/${query.type}/delete/${query.key}`, {
    method: 'POST',
  });
}

export interface FetchFormBody extends RequestBody {
  action: CellAction | TopbarAction;
}

export interface FetchFormPayload {
  body: FetchFormBody;
  query: FetchQuery;
}

export async function fetchForm({ body, query }: FetchFormPayload) {
  return requests<FetchFormBody>(`${APIPrefix}/position/${query.type}/form/${query.key || ''}`, {
    body,
    method: 'POST',
  });
}

export interface CreatePositionBody extends RequestBody {
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

export interface EditPositionBody extends RequestBody {
  [key: string]: any;
}

export interface EditPositionPayload {
  body: EditPositionBody;
  query: FetchQuery;
}

export async function editPosition({ body, query }: EditPositionPayload) {
  return requests<EditPositionBody>(`${APIPrefix}/position/${query.type}/edit/${query.key}`, {
    body,
    method: 'POST',
  });
}

export interface AuditPositionBody extends RequestBody {
  [key: string]: any;
}

export interface AuditPositionPayload {
  body: AuditPositionBody;
  query: FetchQuery;
}

export async function auditPosition({ body, query }: AuditPositionPayload) {
  return requests<AuditPositionBody>(`${APIPrefix}/position/${query.type}/audit/${query.key}`, {
    body,
    method: 'POST',
  });
}

export interface ApplyFormPayload {
  query: FetchQuery;
}

export async function fetchApplyForm({ query }: ApplyFormPayload) {
  return requests(`${APIPrefix}/stuapply/${query.type}/form/${query.key}`, {
    method: 'POST',
  });
}

export interface ApplyPositionBody extends RequestBody {
  [key: string]: any;
}

export interface ApplyPositionPayload {
  body: ApplyPositionBody;
  query: FetchQuery;
}

export async function applyPosition({ body, query }: ApplyPositionPayload) {
  return requests<ApplyPositionBody>(`${APIPrefix}/stuapply/${query.type}/create/${query.key}`, {
    body,
    method: 'POST',
  });
}

export interface TeachingTaskQuery {
  search: string;
}

export interface TeachingTaskPayload {
  query: TeachingTaskQuery;
}

export async function getTeachingTask({ query }: TeachingTaskPayload) {
  return requests(`${APIPrefix}/position/task/${query.search}`, { method: 'POST' });
}
