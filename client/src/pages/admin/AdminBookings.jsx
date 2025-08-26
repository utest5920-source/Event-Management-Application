import React, { useEffect, useState } from 'react'
import { useAuth } from '../../state/AuthContext.jsx'

export default function AdminBookings() {
	const { api } = useAuth()
	const [rows, setRows] = useState([])
	const [loading, setLoading] = useState(true)

	async function load() {
		setLoading(true)
		try {
			const { data } = await api.get('/admin/bookings')
			setRows(data.bookings)
		} catch (e) { alert(e.response?.data?.error || e.message) }
		finally { setLoading(false) }
	}

	useEffect(() => { load() }, [])

	async function updateStatus(id, status) {
		try {
			const { data } = await api.put(`/admin/bookings/${id}/status`, { status })
			setRows(rows.map(r => r.id === id ? { ...r, status: data.booking.status } : r))
		} catch (e) { alert(e.response?.data?.error || e.message) }
	}

	return (
		<div style={{ maxWidth: 900, margin: '20px auto' }}>
			<h2>Admin - Bookings</h2>
			{loading ? <div>Loading...</div> : (
				<table style={{ width: '100%', borderCollapse: 'collapse' }}>
					<thead>
						<tr>
							<th>ID</th>
							<th>User</th>
							<th>Event</th>
							<th>Status</th>
							<th>Notes</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{rows.map(r => (
							<tr key={r.id}>
								<td>{r.id}</td>
								<td>{r.user_mobile}</td>
								<td>{r.event_title}</td>
								<td>{r.status}</td>
								<td>{r.notes}</td>
								<td>
									<select value={r.status} onChange={e => updateStatus(r.id, e.target.value)}>
										<option value="PENDING">Pending</option>
										<option value="APPROVED">Approved</option>
										<option value="REJECTED">Rejected</option>
									</select>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	)
}