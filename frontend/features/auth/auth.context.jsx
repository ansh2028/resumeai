import { createContext, useState, useEffect } from 'react'
import { getMe } from './services/auth.api'

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [user, setuser] = useState(null)
  const [loading, setloading] = useState(true)

  useEffect(() => {
    const getAndSetuser = async () => {
      try {
        const response = await getMe()
        setuser(response?.user || null)
      } catch (error) {
        setuser(null)
      } finally {
        setloading(false)
      }
    }
    getAndSetuser()
  }, [])


  return(
    <AuthContext.Provider value={{
        user,
        loading,
        setuser,
        setloading
    }}>
        {children}
    </AuthContext.Provider>
  )
    
  
}