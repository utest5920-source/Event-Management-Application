import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
	const [token, setToken] = useState(() => localStorage.getItem('token') || '')
	const [user, setUser] = useState(() => {
		const json = localStorage.getItem('user')
		return json ? JSON.parse(json) : null
	})

	useEffect(() => {
		if (token) localStorage.setItem('token', token)
		else localStorage.removeItem('token')
	}, [token])

	useEffect(() => {
		if (user) localStorage.setItem('user', JSON.stringify(user))
		else localStorage.removeItem('user')
	}, [user])

	const api = useMemo(() => {
		const baseURL = import.meta.env.VITE_API_BASE || ''
		const instance = axios.create({ baseURL })
		instance.interceptors.request.use(config => {
			if (token) config.headers.Authorization = `Bearer ${token}`
			return config
		})
		return instance
	}, [token])

	function login(data) {
		setToken(data.token)
		setUser(data.user)
	}

	function logout() {
		setToken('')
		setUser(null)
	}

	const value = { token, user, api, login, logout, setUser }
	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	)
}

export function useAuth() {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error('useAuth must be used within AuthProvider')
	return ctx
}