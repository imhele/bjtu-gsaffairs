import { APIPrefix } from '@/global';
import requests, { RequestBody } from '@/utils/requests';

export interface FetchClientListBody extends RequestBody {
  limit?: number;
  offset?: number;
}

export interface FetchClientQuery {
  type: 'staff' | 'postgraduate';
  key?: string;
}

export interface FetchClientListPayload {
  body: FetchClientListBody;
  query: FetchClientQuery;
}

export async function fetchClientList(payload: FetchClientListPayload) {
  return requests<FetchClientListBody>(`${APIPrefix}/admin/client/${payload.query.type}/list`, {
    body: payload.body,
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
