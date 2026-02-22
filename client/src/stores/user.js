import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)
  const permissions = ref([])

  const isLoggedIn = computed(() => !!token.value)
  const userType = computed(() => userInfo.value?.userType)
  const realName = computed(() => userInfo.value?.realName)
  const roles = computed(() => userInfo.value?.roles || [])

  const hasPermission = (permission) => {
    if (!permission) return true
    if (userInfo.value?.userType === 'admin') return true
    return permissions.value.includes(permission)
  }

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password })
    token.value = res.data.token
    localStorage.setItem('token', res.data.token)
    userInfo.value = res.data.user
    permissions.value = res.data.user.permissions || []
    return res.data
  }

  const getUserInfo = async () => {
    try {
      const res = await api.get('/auth/info')
      userInfo.value = res.data.user
      permissions.value = res.data.user.permissions || []
    } catch (error) {
      logout()
    }
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    permissions.value = []
    localStorage.removeItem('token')
  }

  return {
    token,
    userInfo,
    permissions,
    isLoggedIn,
    userType,
    realName,
    roles,
    hasPermission,
    login,
    getUserInfo,
    logout
  }
})
