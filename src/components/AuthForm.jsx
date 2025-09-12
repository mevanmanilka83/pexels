import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, Loader2, Github } from 'lucide-react'
import { TextInput, SubmitButton } from './Form.jsx'

function AuthForm({ onSuccess }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const contentType = response.headers.get('content-type') || ''
      let data = null
      let text = ''
      if (contentType.includes('application/json')) {
        try {
          data = await response.json()
        } catch {
          data = null
        }
      } else {
        try {
          text = await response.text()
        } catch {
          text = ''
        }
      }

      if (!response.ok) {
        const errorMessage = data?.error || data?.message || text || response.statusText || 'Request failed'
        throw new Error(errorMessage)
      }

      if (data?.token) {
        localStorage.setItem('token', data.token)
      }
      const successMessage = data?.message || text || (mode === 'login' ? 'Logged in' : 'Signed up')
      setMessage(successMessage)
      if (typeof onSuccess === 'function') {
        onSuccess({ token: data?.token, user: data?.user, mode })
      }
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-6xl">
      <div className="overflow-hidden rounded-3xl shadow-2xl bg-white/70">
        <div className="grid min-h-[640px] lg:grid-cols-2">
          <div
            className="hidden lg:block rounded-2xl h-full bg-cover bg-center"
            style={{ backgroundImage: "url('/auth.png')" }}
          />
          <div className="flex flex-col justify-center p-8 sm:p-12">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-6 text-center">
                <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Pexels</div>
                <h2 className="text-3xl font-semibold">
                  {mode === 'login' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {mode === 'login' ? 'Sign in to continue' : 'Start your journey with us'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="block w-full rounded-lg border border-gray-300 bg-white py-3 pr-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="block w-full rounded-lg border border-gray-300 bg-white py-3 pr-12 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="relative flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="ml-2">{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                    </>
                  ) : (
                    mode === 'login' ? 'Sign in to your account' : 'Create account'
                  )}
                </button>

                
              </form>

              {message && (
                <p className="text-sm text-center mt-4 text-gray-700">{message}</p>
              )}

              <div className="text-sm text-center mt-6">
                {mode === 'login' ? (
                  <button className="text-blue-600 hover:underline" onClick={() => setMode('signup')}>
                    Don't have an account? Sign up
                  </button>
                ) : (
                  <button className="text-blue-600 hover:underline" onClick={() => setMode('login')}>
                    Already have an account? Log in
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthForm


