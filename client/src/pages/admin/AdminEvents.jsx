import React, { useEffect, useState } from 'react'
import { useAuth } from '../../state/AuthContext.jsx'

export default function AdminEvents() {
	const { api } = useAuth()
	const [events, setEvents] = useState([])
	const [form, setForm] = useState({ category: '', title: '', budgetMin: '', budgetMax: '', companyName: '', contactNumber: '', location: '', description: '' })
	const [editingId, setEditingId] = useState(null)
	const [loading, setLoading] = useState(true)

	async function load() {
		setLoading(true)
		try {
			const { data } = await api.get('/events')
			setEvents(data.events)
		} catch (e) {
			alert(e.response?.data?.error || e.message)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => { load() }, [])

	async function createEvent(e) {
		e.preventDefault()
		try {
			const { data } = await api.post('/admin/events', {
				...form,
				budgetMin: form.budgetMin ? Number(form.budgetMin) : null,
				budgetMax: form.budgetMax ? Number(form.budgetMax) : null,
			})
			setEvents([data.event, ...events])
			setForm({ category: '', title: '', budgetMin: '', budgetMax: '', companyName: '', contactNumber: '', location: '', description: '' })
		} catch (e) { alert(e.response?.data?.error || e.message) }
	}

	async function updateEvent(id) {
		try {
			const { data } = await api.put(`/admin/events/${id}`, form)
			setEvents(events.map(ev => ev.id === id ? data.event : ev))
			setEditingId(null)
			setForm({ category: '', title: '', budgetMin: '', budgetMax: '', companyName: '', contactNumber: '', location: '', description: '' })
		} catch (e) { alert(e.response?.data?.error || e.message) }
	}

	async function deleteEvent(id) {
		if (!confirm('Delete event?')) return
		try {
			await api.delete(`/admin/events/${id}`)
			setEvents(events.filter(ev => ev.id !== id))
		} catch (e) { alert(e.response?.data?.error || e.message) }
	}

	async function uploadPhotos(id, files) {
		const fd = new FormData()
		for (const f of files) fd.append('photos', f)
		try {
			await api.post(`/admin/events/${id}/photos`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
			alert('Photos uploaded')
		} catch (e) { alert(e.response?.data?.error || e.message) }
	}

	return (
		<div style={{ maxWidth: 1000, margin: '20px auto' }}>
			<h2>Admin - Events</h2>
			<form onSubmit={createEvent} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
				<input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
				<input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
				<input placeholder="Budget Min" value={form.budgetMin} onChange={e => setForm({ ...form, budgetMin: e.target.value })} />
				<input placeholder="Budget Max" value={form.budgetMax} onChange={e => setForm({ ...form, budgetMax: e.target.value })} />
				<input placeholder="Company" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} />
				<input placeholder="Contact" value={form.contactNumber} onChange={e => setForm({ ...form, contactNumber: e.target.value })} />
				<input placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
				<input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
				<button type="submit">Create</button>
			</form>

			{loading ? <div>Loading...</div> : (
				<table style={{ width: '100%', borderCollapse: 'collapse' }}>
					<thead>
						<tr>
							<th style={{ textAlign: 'left' }}>ID</th>
							<th>Category</th>
							<th>Title</th>
							<th>Budget</th>
							<th>Company</th>
							<th>Contact</th>
							<th>Location</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{events.map(ev => (
							<tr key={ev.id}>
								<td>{ev.id}</td>
								<td>{editingId === ev.id ? <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /> : ev.category}</td>
								<td>{editingId === ev.id ? <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /> : ev.title}</td>
								<td>{editingId === ev.id ? (
									<div>
										<input style={{ width: 80 }} value={form.budgetMin} onChange={e => setForm({ ...form, budgetMin: e.target.value })} />
										{' - '}
										<input style={{ width: 80 }} value={form.budgetMax} onChange={e => setForm({ ...form, budgetMax: e.target.value })} />
									</div>
								) : (
									`${ev.budget_min || '-'} - ${ev.budget_max || '-'}`
								)}</td>
								<td>{editingId === ev.id ? <input value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} /> : ev.company_name}</td>
								<td>{editingId === ev.id ? <input value={form.contactNumber} onChange={e => setForm({ ...form, contactNumber: e.target.value })} /> : ev.contact_number}</td>
								<td>{editingId === ev.id ? <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /> : ev.location}</td>
								<td>
									{editingId === ev.id ? (
										<>
											<button onClick={() => updateEvent(ev.id)}>Save</button>
											<button onClick={() => { setEditingId(null); setForm({ category: '', title: '', budgetMin: '', budgetMax: '', companyName: '', contactNumber: '', location: '', description: '' }) }}>Cancel</button>
										</>
									) : (
										<>
											<button onClick={() => { setEditingId(ev.id); setForm({ category: ev.category, title: ev.title, budgetMin: ev.budget_min || '', budgetMax: ev.budget_max || '', companyName: ev.company_name || '', contactNumber: ev.contact_number || '', location: ev.location || '', description: ev.description || '' }) }}>Edit</button>
											<button onClick={() => deleteEvent(ev.id)}>Delete</button>
										</>
									)}
									<div style={{ marginTop: 6 }}>
										<input type="file" multiple onChange={e => uploadPhotos(ev.id, e.target.files)} />
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	)
}