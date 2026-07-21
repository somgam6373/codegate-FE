

const BASE_URL = 'http://localhost:3000'

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

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token')
  const url = `${BASE_URL}${path}`

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    ...init,
  }
  )

  const text = await res.text()
  console.log('[api] 응답 raw text', text)
  let body: unknown = null
  if (text) {
    try {
      body = JSON.parse(text)
      console.log('[api] JSON 파싱 성공', body)
    } catch {
      if (!res.ok) {
        console.log('[api] JSON 파싱 실패 + res.ok=false → HTTP_ERROR')
        throw new ApiError('HTTP_ERROR', `${res.status} ${text}`)
      }
      console.log('[api] JSON 파싱 실패 + res.ok=true → INVALID_RESPONSE')
      throw new ApiError('INVALID_RESPONSE', '서버 응답 형식이 올바르지 않습니다.')
    }
  } else {
    console.log('[api] 응답 본문이 비어있음')
  }

  if (!res.ok) {
    if (isApiResponse(body)) {
      console.log('[api] res.ok=false, ApiResponse 형태의 에러 body', body.error)
      throw new ApiError(
        body.error?.code ?? 'API_ERROR',
        body.error?.message ?? '요청 처리에 실패했습니다.',
        body.error?.details,
      )
    }
    console.log('[api] res.ok=false, ApiResponse 형태가 아닌 body → HTTP_ERROR')
    throw new ApiError('HTTP_ERROR', `${res.status} ${res.statusText}`)
  }

  console.log('[api] 성공, body 반환', body)
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
