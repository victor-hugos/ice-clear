export async function cloudflareApiRequest(path, options = {}) {
  const { body, fetchImpl = fetch, headers = {}, ...requestOptions } = options
  const requestHeaders = { ...headers }
  const requestInit = { ...requestOptions, headers: requestHeaders }

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json'
    requestInit.body = JSON.stringify(body)
  }

  const response = await fetchImpl(path, requestInit)
  const contentType = response.headers.get('Content-Type') ?? ''
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload
        ? payload.error
        : `Cloudflare API request failed with status ${response.status}.`

    throw new Error(message)
  }

  return payload
}
