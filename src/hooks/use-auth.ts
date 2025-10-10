import { useAuthStore } from '@/stores/auth'
import { api } from '@/lib/api'
import { LoginDto, CreateUserDto, AuthResponse, User } from '@/types'

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    isHydrated,
    login,
    logout,
    setLoading,
    updateUser,
    setHydrated
  } = useAuthStore()

  const loginUser = async (credentials: LoginDto) => {
    try {
      setLoading(true)
      const response = await api.post<AuthResponse>('/users/login', credentials)
      login(response.data)
      return response.data
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const registerUser = async (userData: CreateUserDto) => {
    try {
      setLoading(true)
      const response = await api.post<AuthResponse>('/users/register', userData)
      login(response.data)
      return response.data
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logoutUser = () => {
    logout()
  }

  const refreshUser = async () => {
    try {
      setLoading(true)
      const response = await api.get<User>('/users/profile')
      updateUser(response.data)
      return response.data
    } catch (error) {
      logout()
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    isHydrated,
    loginUser,
    registerUser,
    logoutUser,
    refreshUser,
    updateUser,
    setHydrated
  }
}
