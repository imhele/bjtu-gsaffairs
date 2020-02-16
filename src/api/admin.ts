import { APIPrefix } from '@/global';
import requests, { RequestBody } from '@/utils/requests';

export interface FetchClientListBody extends RequestBody {
  limit?: number;
  offset?: number;
}

export interface FetchClientQuery {
  type: 'staff' | 'postgraduate';
  search?: string;
  key?: string;
}

export interface FetchClientListPayload {
  body: FetchClientListBody;
  query: FetchClientQuery;
}

export async function fetchClientList({ query: { type, search }, body }: FetchClientListPayload) {
  return requests<FetchClientListBody>(`${APIPrefix}/admin/client/${type}/list/${search || ''}`, {
    body,
    method: 'POST',
  });
}

export interface DeleteClientPayload {
  query: FetchClientQuery;
}

export async function deleteClient({ query }: DeleteClientPayload) {
  return requests(`${APIPrefix}/admin/client/${query.type}/delete/${query.key}`, {
    method: 'POST',
  });
}

export interface CreateClientBody extends RequestBody {
  [key: string]: any;
}

export interface CreateClientPayload {
  body: CreateClientBody;
  query: FetchClientQuery;
}

export async function createClient({ body, query }: CreateClientPayload) {
  return requests<CreateClientBody>(`${APIPrefix}/admin/client/${query.type}/create`, {
    body,
    method: 'POST',
  });
}

export interface EditClientBody extends RequestBody {
  [key: string]: any;
}

export interface EditClientPayload {
  body: EditClientBody;
  query: FetchClientQuery;
}

export async function editClient({ body, query }: EditClientPayload) {
  return requests<EditClientBody>(`${APIPrefix}/admin/client/${query.type}/edit/${query.key}`, {
    body,
    method: 'POST',
  });
}

export interface TimeConfig {
  id?: number;
  used: number;
  position_start: number;
  position_end: number;
  apply_start: number;
  apply_end: number;
  max_workload: number;
  available_semesters: string;
}

export interface FetchTimePayload {
  action: string;
  body?: { [key: string]: any };
}

export async function timeConfig({ action, body }: FetchTimePayload) {
  return requests(`${APIPrefix}/admin/time/${action}`, { body, method: 'POST' });
}

export interface FetchDepAdminQuery {
  key: string;
}

export interface FetchDepAdminListBody extends RequestBody {
  limit?: number;
  offset?: number;
}

export interface FetchDepAdminListPayload {
  body: FetchDepAdminListBody;
}

export async function fetchDepAdminList({body }: FetchDepAdminListPayload) {
  return requests<FetchDepAdminListBody>(`${APIPrefix}/admin/depadmin/list`, {
    body,
    method: 'POST',
  });
}

export interface DeleteDepAdminPayload {
  query: FetchDepAdminQuery;
}

export async function deleteDepAdmin({ query }: DeleteDepAdminPayload) {
  return requests(`${APIPrefix}/admin/depadmin/delete/${query.key}`, {
    method: 'POST',
  });
}

export interface CreateDepAdminBody extends RequestBody {
  [key: string]: any;
}

export interface CreateDepAdminPayload {
  body: CreateDepAdminBody;
}

export async function createDepAdmin({ body }: CreateDepAdminPayload) {
  return requests<CreateDepAdminBody>(`${APIPrefix}/admin/depadmin/create`, {
    body,
    method: 'POST',
  });
}
