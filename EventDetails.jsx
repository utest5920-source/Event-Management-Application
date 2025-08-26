import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const EventDetails = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    package_id: '',
    booking_date: '',
    message: ''
  });

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(`/api/events/${id}`);
      setEvent(response.data.event);
    } catch (error) {
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to book an event');
      return;
    }

    try {
      const bookingPayload = {
        event_id: parseInt(id),
        booking_date: bookingData.booking_date,
        message: bookingData.message
      };

      if (bookingData.package_id) {
        bookingPayload.package_id = parseInt(bookingData.package_id);
      }

      await axios.post('/api/bookings', bookingPayload);
      toast.success('Booking request sent successfully!');
      setShowBookingForm(false);
      setBookingData({ package_id: '', booking_date: '', message: '' });
    } catch (error) {
      toast.error('Failed to send booking request');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mt-5 text-center">
        <h2>Event not found</h2>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-8">
          {/* Event Photos */}
          {event.photos && event.photos.length > 0 && (
            <div className="mb-4">
              <div id="eventCarousel" className="carousel slide" data-bs-ride="carousel">
                <div className="carousel-inner">
                  {event.photos.map((photo, index) => (
                    <div key={photo.photo_id} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                      <img 
                        src={`http://localhost:5000${photo.photo_url}`} 
                        alt={photo.alt_text}
                        className="d-block w-100"
                        style={{ height: '400px', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
                {event.photos.length > 1 && (
                  <>
                    <button className="carousel-control-prev" type="button" data-bs-target="#eventCarousel" data-bs-slide="prev">
                      <span className="carousel-control-prev-icon"></span>
                    </button>
                    <button className="carousel-control-next" type="button" data-bs-target="#eventCarousel" data-bs-slide="next">
                      <span className="carousel-control-next-icon"></span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Event Description */}
          <div className="card mb-4">
            <div className="card-body">
              <h2>{event.title}</h2>
              <p className="text-muted mb-3">{event.event_type}</p>
              {event.description && (
                <p>{event.description}</p>
              )}
            </div>
          </div>

          {/* Packages */}
          {event.packages && event.packages.length > 0 && (
            <div className="card mb-4">
              <div className="card-header">
                <h4>Available Packages</h4>
              </div>
              <div className="card-body">
                <div className="row">
                  {event.packages.map(pkg => (
                    <div key={pkg.package_id} className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <h5 className="card-title">{pkg.package_name}</h5>
                          <p className="card-text text-success h5">₹{pkg.price?.toLocaleString()}</p>
                          {pkg.description && (
                            <p className="card-text">{pkg.description}</p>
                          )}
                          {pkg.features && (
                            <ul className="list-unstyled">
                              {JSON.parse(pkg.features).map((feature, index) => (
                                <li key={index}><i className="fas fa-check text-success me-2"></i>{feature}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="col-lg-4">
          {/* Event Info Card */}
          <div className="card mb-4">
            <div className="card-header">
              <h4>Event Information</h4>
            </div>
            <div className="card-body">
              <p><strong>Company:</strong> {event.company_name}</p>
              <p><strong>Contact:</strong> {event.contact_number}</p>
              <p><strong>Location:</strong> {event.location}</p>
              <p><strong>Budget Range:</strong> ₹{event.budget_min?.toLocaleString()} - ₹{event.budget_max?.toLocaleString()}</p>
