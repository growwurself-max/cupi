/**
 * Where the browser keeps its customer session token. localStorage (not a
 * cookie) so every request stays a plain, CORS-friendly `Authorization` bearer
 * and nothing is ever attached to a cross-site request: there is no CSRF
 * surface because the token is never sent implicitly.
 */
const CUSTOMER_TOKEN_KEY = 'cupi_auth_token'

export function getCustomerToken(): string | null {
  try {
    return localStorage.getItem(CUSTOMER_TOKEN_KEY)
  } catch {
    return null
  }
}

export function setCustomerToken(token: string): void {
  try {
    localStorage.setItem(CUSTOMER_TOKEN_KEY, token)
  } catch {
    // Private mode or a full quota: the session still works for this tab.
  }
}

export function clearCustomerToken(): void {
  try {
    localStorage.removeItem(CUSTOMER_TOKEN_KEY)
  } catch {
    // Nothing to recover from.
  }
}