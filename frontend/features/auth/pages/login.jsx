import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import '../auth.form.scss'
import { useAuth } from '../hooks/useAuth.js'

const Login = () => {
  const { loading, handlelogin } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handlesubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    try {
      await handlelogin({ email, password })
      navigate('/')
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed. Please check your credentials.')
    }
  }

  return (
    <main>
      <div className="form-container">
        <h1>Login</h1>

        {error && <div className="error-message" style={{ color: '#ff4d4f', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handlesubmit}>
          <div className="input-group">
            <label htmlFor="email">Email or Username</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="text"
              name="email"
              id="email"
              placeholder="Enter Email or Username"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              name="password"
              id="password"
              placeholder="Enter Password"
              required
            />
          </div>
          <button className="button primary-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p>Don't have an Account ? <Link to="/register">Register</Link></p>
      </div>
    </main>
  )
}

export default Login