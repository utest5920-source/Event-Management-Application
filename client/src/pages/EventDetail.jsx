import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'

export default function EventDetail() {
	const { id } = useParams()
	const { api, user } = useAuth()
	const [data, setData] = useState(null)
	const [notes, setNotes] = useState('')
	const [loading, setLoading] = useState(true)
	const [booking, setBooking] = useState(null)

	useEffect(() => {
		async function load() {
			setLoading(true)
			try {
				const res = await api.get(`/events/${id}`)
				setData(res.data)
			} catch (e) {
				alert(e.response?.data?.error || e.message)
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [api, id])

	async function requestBooking() {
		try {
			const { data } = await api.post('/events/bookings', { eventId: Number(id), notes })
			setBooking(data.booking)
			alert('Booking requested')
		} catch (e) {
			alert(e.response?.data?.error || e.message)
		}
	}

	if (loading) return <div style={{ padding: 20 }}>Loading...</div>
	if (!data) return <div style={{ padding: 20 }}>Not found</div>
	const { event, photos } = data
	return (
		<div style={{ maxWidth: 960, margin: '20px auto' }}>
			<h2>{event.title}</h2>
			<p>Category: {event.category}</p>
			<p>Budget: {event.budget_min || '-'} - {event.budget_max || '-'}</p>
			<p>Company: {event.company_name}</p>
			<p>Contact: {event.contact_number}</p>
			<p>Location: {event.location}</p>
			<p>Description: {event.description}</p>
			<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
				{photos.map(p => (
					<img key={p.id} src={p.file_path} alt="" style={{ width: 200, height: 140, objectFit: 'cover', borderRadius: 6 }} />
				))}
			</div>
			{user && (
				<div style={{ marginTop: 20 }}>
					<textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes" rows={4} style={{ width: '100%', padding: 8 }} />
					<button style={{ marginTop: 8 }} onClick={requestBooking}>Request Booking</button>
					{booking && <p>Booking #{booking.id} - {booking.status}</p>}
				</div>
			)}
		</div>
	)
}