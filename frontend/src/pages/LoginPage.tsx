import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import logo from '../assets/greenLogo.svg'
import { useAuth } from '../utils/AuthContext'

interface LoginPageProps {
    onLogin: (email: string, password: string) => Promise<string | null>
}

const BASEURL = 'http://localhost:8081'

const LoginPage = ({ onLogin }: LoginPageProps) => {
    const navigate = useNavigate()
    const [isLoginMode, setIsLoginMode] = useState(true)
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [role, setRole] = useState('USER')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')

    const { login } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Registo
        if (!isLoginMode) {
            if (password !== confirmPassword) {
                setError('Passwords do not match')
                return
            }

            try {
                const response = await fetch(`${BASEURL}/api/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({ email, password, name, role })
                })

                if (!response.ok) {
                    const msg = await response.text()
                    throw new Error(msg || 'Failed to register')
                }

                setIsLoginMode(true)
                setError('') 
            } catch (err: any) {
                setError(err.message || 'Failed to register')
            }

            return
        }

        const redirectPath = await onLogin(email, password)
        if (redirectPath) {
            const info = JSON.parse(localStorage.getItem('userInfo') || '{}')
            const roleRaw = (localStorage.getItem('role') || 'USER').toLowerCase()
            const role = roleRaw === 'admin' ? 'admin' : 'user'
            const token = localStorage.getItem('jwt') 
            if (!token) {
                setError('No token found, please log in again')
                return
            }
            login(token, { id: info.userId || info.id, name: info.name, email: info.email, role })
            navigate(redirectPath)
        } else {
            setError('Invalid credentials')
        }

    }
    const handleToggleMode = () => {
        setIsLoginMode(!isLoginMode)
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        setError('')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="card max-w-md w-full p-8">
                <div className="flex flex-col items-center mb-8">
                    <img src={logo} alt="Logo" className="h-24 w-auto mb-6" />
                    <h1 className="text-2xl font-bold text-gray-800">
                        {isLoginMode ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-gray-600">
                        {isLoginMode ? 'Sign in to continue' : 'Sign up to get started'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLoginMode && (
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Enter your name"
                                required
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Enter your password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {!isLoginMode && (
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Confirm your password"
                                required
                            />
                        </div>
                    )}

                    {!isLoginMode && (
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                            </label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            >
                                <option value="USER">User</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-[#243E16] hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                        {isLoginMode ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    {isLoginMode ? "Don't have an account?" : "Already have an account?"}{' '}
                    <button
                        onClick={handleToggleMode}
                        className="text-green-700 hover:text-green-800 font-medium"
                    >
                        {isLoginMode ? 'Sign Up' : 'Sign In'}
                    </button>
                </div>

                {error && (
                    <div className="text-red-600 text-sm text-center mt-4">
                        {error}
                    </div>
                )}
            </div>
        </div>
    )
}

export default LoginPage