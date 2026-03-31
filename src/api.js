import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT to every request — token is stored in sessionStorage by AuthContext
api.interceptors.request.use(config => {
  try {
    const token = sessionStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch {}
  return config
})

// On 401: clear session but do NOT hard-redirect.
// CartContext / AuthContext handle navigation gracefully via React Router.
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      try {
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('user')
      } catch {}
      delete api.defaults.headers.common['Authorization']
    }
    return Promise.reject(err)
  }
)

export default api
