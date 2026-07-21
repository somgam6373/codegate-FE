const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: { code: string; message: string; details?: Record<string, unknown> } | null
}

export class ApiError extends Error {
  code: string
  details?: Record<string, unknown>

  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(message)
    this.code = code
    this.details = details
  }
}

export function unwrapApiResponse<T>(body: ApiResponse<T>): T {
  if (!body.success || body.data === null) {
    throw new ApiError(
      body.error?.code ?? 'API_ERROR',
      body.error?.message ?? '요청 처리에 실패했습니다.',
      body.error?.details,
    )
  }
  return body.data
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  error: string | null
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token')
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    ...init,
  })

  const text = await res.text()
  let body: unknown = null
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      if (!res.ok) throw new ApiError('HTTP_ERROR', `${res.status} ${text}`)
      throw new ApiError('INVALID_RESPONSE', '서버 응답 형식이 올바르지 않습니다.')
    }
  }

  if (!res.ok) {
    if (isApiResponse(body)) {
      throw new ApiError(
        body.error?.code ?? 'API_ERROR',
        body.error?.message ?? '요청 처리에 실패했습니다.',
        body.error?.details,
      )
    }
    throw new ApiError('HTTP_ERROR', `${res.status} ${res.statusText}`)
  }

  return body as T
}

function isApiResponse(body: unknown): body is ApiResponse<unknown> {
  return (
    typeof body === 'object' &&
    body !== null &&
    'success' in body &&
    typeof (body as { success: unknown }).success === 'boolean'
  )
}
