import api from './api'

const auth = {
  async login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', res.data.token)
    this.setCurrentUser(res.data.user)
    return res.data.user
  },
  getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('user')) } catch (e) { return null }
  },
  setCurrentUser(u) { localStorage.setItem('user', JSON.stringify(u)) },
  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
  async register(data) {
    const res = await api.post('/auth/register', data)
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    return res.data.user
  }
}

export default auth
