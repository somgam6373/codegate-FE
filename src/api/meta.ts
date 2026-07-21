import { api, unwrapApiResponse } from './client'
import type { ApiResponse } from './client'

export interface MetaItem {
  code: string
  label: string
}

export function getDistricts() {
  return api<ApiResponse<MetaItem[]>>('/api/v1/meta/districts').then(unwrapApiResponse)
}

export function getDepartments() {
  return api<ApiResponse<MetaItem[]>>('/api/v1/meta/departments').then(unwrapApiResponse)
}
