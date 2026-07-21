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

export async function unwrap<T>(res: Promise<ApiResponse<T>>): Promise<T> {
  const body = await res
  console.log('[unwrap] 전달받은 body', body)
  if (!body.success || body.data === null) {
    console.log('[unwrap] success=false 이거나 data=null → ApiError throw', body.error)
    throw new ApiError(
      body.error?.code ?? 'API_ERROR',
      body.error?.message ?? '요청 처리에 실패했습니다.',
      body.error?.details,
    )
  }
  console.log('[unwrap] 성공, data 반환', body.data)
  return body.data
}