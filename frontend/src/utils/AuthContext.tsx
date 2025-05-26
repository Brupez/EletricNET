import { createContext, useContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'

interface User {
  name: string
  email: string
  role: 'admin' | 'user'
}

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('jwt')
    const info = JSON.parse(localStorage.getItem('userInfo') || '{}')
    if (token && info.name && info.email) {
      try {
        const decoded: any = jwtDecode(token)
        const now = Date.now() / 1000
        if (decoded.exp && decoded.exp < now) {
          localStorage.clear()
          setUser(null)
        } else {
          const roleRaw = (localStorage.getItem('role') || 'USER').toLowerCase()
          const role: 'admin' | 'user' = roleRaw === 'admin' ? 'admin' : 'user'
          setUser({ name: info.name, email: info.email, role })
        }
      } catch (err) {
        localStorage.clear()
        setUser(null)
      }
    } else {
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
