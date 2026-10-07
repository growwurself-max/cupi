/**
 * AuthProvider — one React context owns the signed-in state for the whole
 * storefront.
 *
 * On boot it silently restores the session from localStorage (it never blocks
 * paint — the site works fully signed out) and it exposes just enough for the
 * UI: the account, a way to open the login/sign-up modal from anywhere, and the
 * apply/log-out helpers that keep the stored token in sync with the server.
 */
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ApiError, fetchMe, logout, type AuthResponse, type CustomerPublic } from './api.ts'
import { clearCustomerToken, getCustomerToken, setCustomerToken } from './authToken.ts'
import { AuthContext, type AuthContextValue, type AuthModalMode } from './authContext.ts'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerPublic | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalMode, setModalMode] = useState<AuthModalMode | null>(null)

  useEffect(() => {
    let cancelled = false
    async function restore() {
      if (!getCustomerToken()) {
        if (!cancelled) setLoading(false)
        return
      }
      try {
        const response = await fetchMe()
        if (!cancelled && response.success) setCustomer(response.customer)
      } catch (error) {
        // A rejected token just means the guest experience; anything else
        // (server waking up, offline) also leaves the storefront fully usable.
        if (!cancelled && error instanceof ApiError && error.status === 401) {
          clearCustomerToken()
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void restore()
    return () => {
      cancelled = true
    }
  }, [])

  const openAuth = useCallback((mode: AuthModalMode = 'login') => {
    setModalMode(mode)
  }, [])

  const closeAuth = useCallback(() => {
    setModalMode(null)
  }, [])

  const applyAuthResponse = useCallback((response: AuthResponse) => {
    if (response.token) setCustomerToken(response.token)
    if (response.customer) setCustomer(response.customer)
  }, [])

  const signOut = useCallback(async () => {
    // The server-side endpoint is best effort; the browser drops the token
    // regardless, and a call that fails must not keep the user signed in.
    try {
      await logout()
    } catch {
      // Nothing the user can do about it — the local sign-out is what counts.
    }
    clearCustomerToken()
    setCustomer(null)
  }, [])

  const refreshMe = useCallback(async () => {
    try {
      const response = await fetchMe()
      if (response.success) setCustomer(response.customer)
    } catch {
      // A stale-but-present token makes this 401; drop it and return to guest.
      clearCustomerToken()
      setCustomer(null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      customer,
      loading,
      modalMode,
      openAuth,
      closeAuth,
      applyAuthResponse,
      signOut,
      refreshMe,
    }),
    [customer, loading, modalMode, openAuth, closeAuth, applyAuthResponse, signOut, refreshMe],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}