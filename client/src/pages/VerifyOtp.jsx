import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'

export default function VerifyOtp() {
	const { state } = useLocation()
	const [otp, setOtp] = useState(state?.otp || '')
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()
	const { api, login } = useAuth()

	async function onSubmit(e) {
		e.preventDefault()
		setLoading(true)
		try {
			const mobile = state?.mobile
			if (!mobile) throw new Error('Missing mobile')
			const { data } = await api.post('/auth/verify-otp', { mobile, otp })
			login(data)
			navigate('/')
		} catch (e) {
			alert(e.response?.data?.error || e.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div style={{ maxWidth: 420, margin: '40px auto' }}>
			<h2>Verify OTP</h2>
			<form onSubmit={onSubmit}>
				<input value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter OTP" required style={{ width: '100%', padding: 8, marginBottom: 12 }} />
				<button disabled={loading} type="submit">{loading ? 'Verifying...' : 'Verify'}</button>
			</form>
		</div>
	)
}