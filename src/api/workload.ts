import { APIPrefix } from '@/global';
import requests, { RequestBody } from '@/utils/requests';

export interface FetchListBody extends RequestBody {
  limit?: number;
  offset?: number;
  student?: string;
  time?: string;
  type?: string;
}

export async function fetchList(body: FetchListBody) {
  return requests<FetchListBody>(`${APIPrefix}/stuapply/workload/list`, {
    body,
    method: 'POST',
  });
}

export interface CreateWorkloadBody extends RequestBody {
  stuapplyId: number;
  amount: number;
  time: string;
  type: string;
}

export async function createWorkload(body: CreateWorkloadBody) {
  return requests<CreateWorkloadBody>(`${APIPrefix}/stuapply/workload/create`, {
    body,
    method: 'POST',
  });
}

export interface EditWorkloadBody extends RequestBody {
  id: number;
  amount: number;
  type: string;
}

export async function editWorkload(body: EditWorkloadBody) {
  return requests<EditWorkloadBody>(`${APIPrefix}/stuapply/workload/edit`, {
    body,
    method: 'POST',
  });
}

export interface AuditWorkloadBody extends RequestBody {
  id: number;
  status: string;
  type: string;
}

export async function auditWorkload(body: AuditWorkloadBody) {
  return requests<AuditWorkloadBody>(`${APIPrefix}/stuapply/workload/audit`, {
    body,
    method: 'POST',
  });
}
