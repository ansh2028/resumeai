import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import '../auth.form.scss'
import { useAuth } from '../hooks/useAuth.js'

const Register = () => {
  const { loading, handleRegister } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handlesubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username || !email || !password) {
      setError('Please fill in all fields')
      return
    }

    try {
      await handleRegister({ username, email, password })
      navigate('/login')
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <main>
      <div className="form-container">
        <h1>Register</h1>

        {error && <div className="error-message" style={{ color: '#ff4d4f', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handlesubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              name="username"
              id="username"
              placeholder="Enter username"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              name="email"
              id="email"
              placeholder="Enter Email Address"
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
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p>Already have an Account ? <Link to="/login">Login</Link></p>
      </div>
    </main>
  )
}

export default Register