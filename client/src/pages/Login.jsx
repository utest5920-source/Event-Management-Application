import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'

export default function Login() {
	const [mobile, setMobile] = useState('')
	const [serverOtp, setServerOtp] = useState('')
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()
	const { api } = useAuth()

	async function requestOtp(e) {
		e.preventDefault()
		setLoading(true)
		try {
			const { data } = await api.post('/auth/request-otp', { mobile })
			setServerOtp(data.otp)
			navigate('/verify-otp', { state: { mobile, otp: data.otp } })
		} catch (e) {
			alert(e.response?.data?.error || e.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div style={{ maxWidth: 420, margin: '40px auto' }}>
			<h2>Login with Mobile</h2>
			<form onSubmit={requestOtp}>
				<input value={mobile} onChange={e => setMobile(e.target.value)} placeholder="Mobile number" required style={{ width: '100%', padding: 8, marginBottom: 12 }} />
				<button disabled={loading} type="submit">{loading ? 'Sending...' : 'Send OTP'}</button>
			</form>
			{serverOtp && (
				<p style={{ marginTop: 12 }}>Demo OTP: <b>{serverOtp}</b></p>
			)}
		</div>
	)
}