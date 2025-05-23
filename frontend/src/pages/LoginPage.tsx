import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import logo from '../assets/greenLogo.svg'

interface LoginPageProps {
    onLogin: (email: string, password: string) => string | null
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
    const navigate = useNavigate()
    const [isLoginMode, setIsLoginMode] = useState(true)
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!isLoginMode) {
            if (password !== confirmPassword) {
                setError('Passwords do not match')
                return
            }
            // Add signup logic here
            console.log('Signup:', { email, password })
            setIsLoginMode(true)
            return
        }

        const redirectPath = onLogin(email, password)
        if (redirectPath) {
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