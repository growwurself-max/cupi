/**
 * Context + hook for the signed-in customer. Kept in its own file (away from
 * the <AuthProvider> component) so React fast-refresh keeps working when the
 * provider is edited.
 */
import { createContext, useContext } from 'react'
import type { AuthResponse, CustomerPublic } from './api.ts'

export type AuthModalMode = 'login' | 'signup'

export interface AuthContextValue {
  /** The signed-in account, or null for the anonymous guest experience. */
  customer: CustomerPublic | null
  /** True while the persisted session is being re-checked on startup. */
  loading: boolean
  /** Controls which modal is showing, if any. */
  modalMode: AuthModalMode | null
  openAuth: (mode?: AuthModalMode) => void
  closeAuth: () => void
  /** Persists a token + account from any successful login/signup/google call. */
  applyAuthResponse: (response: AuthResponse) => void
  signOut: () => Promise<void>
  /** Re-pull the account (e-mail verification may have changed it). */
  refreshMe: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.')
  return context
}