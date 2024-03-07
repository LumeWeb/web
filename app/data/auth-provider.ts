import { AuthProvider } from "@refinedev/core"
import type {
  AuthActionResponse,
  CheckResponse,
  OnErrorResponse
} from "@refinedev/core/dist/interfaces"

export const authProvider: AuthProvider = {
  login: async (params: any) => {
    return { success: true } satisfies AuthActionResponse
  },
  logout: async (params: any) => {
    return { success: true } satisfies AuthActionResponse
  },
  check: async (params?: any) => {
    return { authenticated: true } satisfies CheckResponse
  },
  onError: async (error: any) => {
    return { logout: true } satisfies OnErrorResponse
  },
  register: async (params: any) => {
    return { success: true } satisfies AuthActionResponse
  },
  forgotPassword: async (params: any) => {
    return { success: true } satisfies AuthActionResponse
  },
  updatePassword: async (params: any) => {
    return { success: true } satisfies AuthActionResponse
  },
  getPermissions: async (params: any) => {
    return { success: true } satisfies AuthActionResponse
  },
  getIdentity: async (params: any) => { 
    return { id: "1", fullName: "John Doe", avatar: "https://via.placeholder.com/150" }
  }
}
