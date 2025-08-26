import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import VerifyOtp from './pages/VerifyOtp.jsx'
import EventsList from './pages/EventsList.jsx'
import EventDetail from './pages/EventDetail.jsx'
import Profile from './pages/Profile.jsx'
import AdminEvents from './pages/admin/AdminEvents.jsx'
import AdminBookings from './pages/admin/AdminBookings.jsx'
import { useAuth } from './state/AuthContext.jsx'

function Nav() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	return (
		<nav style={{ display: 'flex', gap: 12, padding: 12, borderBottom: '1px solid #ddd' }}>
			<Link to="/">Events</Link>
			{user && <Link to="/profile">Profile</Link>}
			{user?.role === 'ADMIN' && <Link to="/admin/events">Admin Events</Link>}
			{user?.role === 'ADMIN' && <Link to="/admin/bookings">Admin Bookings</Link>}
			<div style={{ marginLeft: 'auto' }}>
				{user ? (
					<button onClick={() => { logout(); navigate('/'); }}>Logout</button>
				) : (
					<Link to="/login">Login</Link>
				)}
			</div>
		</nav>
	);
}

function Protected({ children, role }) {
	const { user } = useAuth();
	if (!user) return <Navigate to="/login" replace />;
	if (role && user.role !== role) return <Navigate to="/" replace />;
	return children;
}

export default function App() {
	return (
		<div>
			<Nav />
			<Routes>
				<Route path="/" element={<EventsList />} />
				<Route path="/events/:id" element={<EventDetail />} />
				<Route path="/login" element={<Login />} />
				<Route path="/verify-otp" element={<VerifyOtp />} />
				<Route path="/profile" element={<Protected><Profile /></Protected>} />
				<Route path="/admin/events" element={<Protected role="ADMIN"><AdminEvents /></Protected>} />
				<Route path="/admin/bookings" element={<Protected role="ADMIN"><AdminBookings /></Protected>} />
			</Routes>
		</div>
	)
}
