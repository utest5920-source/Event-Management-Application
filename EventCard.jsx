import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  const getEventTypeColor = (type) => {
    switch (type) {
      case 'Wedding': return 'success';
      case 'Birthday Party': return 'info';
      case 'Baby Shower': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="card event-card h-100">
        {event.featured_image && (
          <img 
            src={`http://localhost:5000${event.featured_image}`} 
            alt={event.title}
            className="card-img-top event-image"
          />
        )}
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="card-title">{event.title}</h5>
            <span className={`badge bg-${getEventTypeColor(event.event_type)}`}>
              {event.event_type}
            </span>
          </div>
          <h6 className="card-subtitle mb-2 text-muted">{event.company_name}</h6>
          <p className="card-text">
            <i className="fas fa-map-marker-alt me-1"></i>
            {event.location}
          </p>
          <p className="card-text">
            <i className="fas fa-rupee-sign me-1"></i>
            ₹{event.budget_min?.toLocaleString()} - ₹{event.budget_max?.toLocaleString()}
          </p>
          <p className="card-text">
            <i className="fas fa-phone me-1"></i>
            {event.contact_number}
          </p>
        </div>
        <div className="card-footer">
          <Link to={`/events/${event.event_id}`} className="btn btn-primary w-100">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
