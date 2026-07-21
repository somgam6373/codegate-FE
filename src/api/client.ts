const BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })

  const text = await res.text()
  let body: unknown = null
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      if (!res.ok) throw new Error(`${res.status} ${text}`)
      throw new Error('서버 응답 형식이 올바르지 않습니다.')
    }
  }

  if (!res.ok && !isApiResponse(body)) {
    throw new Error(`${res.status} ${text}`)
  }

  return body as T
}

function isApiResponse(body: unknown): body is { success: boolean } {
  return (
    typeof body === 'object' &&
    body !== null &&
    'success' in body &&
    typeof (body as { success: unknown }).success === 'boolean'
  )
}
