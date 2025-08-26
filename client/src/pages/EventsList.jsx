import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'

export default function EventsList() {
	const { api } = useAuth()
	const [events, setEvents] = useState([])
	const [loading, setLoading] = useState(true)
	const [q, setQ] = useState('')
	const [category, setCategory] = useState('')

	async function load() {
		setLoading(true)
		try {
			const { data } = await api.get('/events', { params: { q, category } })
			setEvents(data.events)
		} catch (e) {
			alert(e.response?.data?.error || e.message)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		load()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<div style={{ maxWidth: 960, margin: '20px auto' }}>
			<h2>Events</h2>
			<div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
				<input value={q} onChange={e => setQ(e.target.value)} placeholder="Search" style={{ padding: 8, flex: 1 }} />
				<select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: 8 }}>
					<option value="">All</option>
					<option>Wedding</option>
					<option>Birthday</option>
					<option>Baby Shower</option>
				</select>
				<button onClick={load}>Apply</button>
			</div>
			{loading ? (
				<div>Loading...</div>
			) : (
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
					{events.map(ev => (
						<Link key={ev.id} to={`/events/${ev.id}`} style={{ border: '1px solid #eee', borderRadius: 6, padding: 12, textDecoration: 'none', color: 'inherit' }}>
							<h3 style={{ marginTop: 0 }}>{ev.title}</h3>
							<p style={{ margin: '4px 0' }}>{ev.category}</p>
							<p style={{ margin: '4px 0' }}>Budget: {ev.budget_min || '-'} - {ev.budget_max || '-'}</p>
							<p style={{ margin: '4px 0' }}>{ev.company_name}</p>
							<p style={{ margin: '4px 0' }}>{ev.location}</p>
						</Link>
					))}
				</div>
			)}
		</div>
	)
}