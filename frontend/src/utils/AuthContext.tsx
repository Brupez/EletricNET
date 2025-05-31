import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { jwtDecode } from 'jwt-decode'

interface User {
  id: string;
  name: string
  email: string
  role: 'admin' | 'user'
  token: string; // Adicionado token ao objeto user
}

interface AuthContextType {
  user: User | null
  login: (token: string, userData: Omit<User, 'token'>) => void
  logout: () => void
  isAuthenticated: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('jwt')
    if (token) {
      try {
        const decoded: any = jwtDecode(token)
        const now = Date.now() / 1000
        
        if (decoded.exp && decoded.exp < now) {
          logout()
        } else {
          const userData = JSON.parse(localStorage.getItem('userInfo') || '{}')
          setUser({
            id: decoded.sub || userData.userId,
            name: userData.name,
            email: userData.email,
            role: decoded.role?.toLowerCase() === 'admin' ? 'admin' : 'user',
            token
          })
        }
      } catch (err) {
        logout()
      }
    }
  }, [])

  const login = useCallback((token: string, userData: Omit<User, 'token'>) => {
    localStorage.setItem('jwt', token)
    localStorage.setItem('userInfo', JSON.stringify(userData))
    
    setUser({
      ...userData,
      token
    })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('jwt')
    localStorage.removeItem('userInfo')
    setUser(null)
  }, [])

  const isAuthenticated = useCallback(() => {
    return !!user && !!user.token
  }, [user])

  const value = {
    user,
    login,
    logout,
    isAuthenticated
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}