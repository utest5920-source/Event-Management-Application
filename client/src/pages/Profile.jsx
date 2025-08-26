import React, { useEffect, useState } from 'react'
import { useAuth } from '../state/AuthContext.jsx'

export default function Profile() {
	const { api, user } = useAuth()
	const [profile, setProfile] = useState({ name: '', gender: '', location: '' })
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)

	useEffect(() => {
		async function load() {
			try {
				const { data } = await api.get('/auth/me')
				setProfile(data.profile || { name: '', gender: '', location: '' })
			} catch (e) {
				alert(e.response?.data?.error || e.message)
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [api])

	async function onSave(e) {
		e.preventDefault()
		setSaving(true)
		try {
			const { data } = await api.put('/auth/me/profile', profile)
			setProfile(data.profile)
			alert('Profile updated')
		} catch (e) {
			alert(e.response?.data?.error || e.message)
		} finally {
			setSaving(false)
		}
	}

	if (loading) return <div style={{ padding: 20 }}>Loading...</div>
	return (
		<div style={{ maxWidth: 520, margin: '20px auto' }}>
			<h2>My Profile</h2>
			<p>Mobile: <b>{user?.mobile}</b></p>
			<form onSubmit={onSave}>
				<input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="Name" style={{ width: '100%', padding: 8, marginBottom: 8 }} />
				<input value={profile.gender} onChange={e => setProfile({ ...profile, gender: e.target.value })} placeholder="Gender" style={{ width: '100%', padding: 8, marginBottom: 8 }} />
				<input value={profile.location} onChange={e => setProfile({ ...profile, location: e.target.value })} placeholder="Location" style={{ width: '100%', padding: 8, marginBottom: 8 }} />
				<button disabled={saving} type="submit">{saving ? 'Saving...' : 'Save'}</button>
			</form>
		</div>
	)
}