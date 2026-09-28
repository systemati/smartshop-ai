import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react'

import api from '../services/api'


const AuthContext = createContext(null)


export function AuthProvider({ children }) {

  const [user, setUser] = useState(null)

  const [loading, setLoading] = useState(true)


  // ------------------------------------------------
  // LOAD SAVED SESSION
  // ------------------------------------------------

  useEffect(() => {

    const token = localStorage.getItem(
      'smartshop_token'
    )

    if (!token) {

      setLoading(false)

      return
    }


    loadCurrentUser()

  }, [])


  // ------------------------------------------------
  // CURRENT USER
  // ------------------------------------------------

  const loadCurrentUser = async () => {

    try {

      const response = await api.get(
        '/api/auth/me',
        {
          headers: {
            Authorization:
              `Bearer ${localStorage.getItem('smartshop_token')}`
          }
        }
      )

      setUser(response.data)

    } catch (error) {

      console.error(
        'Session validation failed:',
        error
      )

      localStorage.removeItem(
        'smartshop_token'
      )

      setUser(null)

    } finally {

      setLoading(false)

    }
  }


  // ------------------------------------------------
  // LOGIN
  // ------------------------------------------------

  const login = async (
    email,
    password
  ) => {

    const response = await api.post(
      '/api/auth/login',
      {
        email,
        password
      }
    )


    const token =
      response.data.access_token


    localStorage.setItem(
      'smartshop_token',
      token
    )


    await loadCurrentUser()

    return response.data
  }


  // ------------------------------------------------
  // REGISTER
  // ------------------------------------------------

  const register = async (
    firstName,
    lastName,
    email,
    password
  ) => {

    const response = await api.post(
      '/api/auth/register',
      {
        first_name: firstName,
        last_name: lastName,
        email,
        password
      }
    )


    return response.data
  }


  // ------------------------------------------------
  // LOGOUT
  // ------------------------------------------------

  const logout = () => {

    localStorage.removeItem(
      'smartshop_token'
    )

    setUser(null)

  }


  return (

    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user
      }}
    >

      {children}

    </AuthContext.Provider>

  )
}


export function useAuth() {

  return useContext(
    AuthContext
  )

}