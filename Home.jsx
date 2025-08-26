import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EventCard from '../components/EventCard';
import { toast } from 'react-toastify';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    event_type: '',
    location: '',
    min_budget: '',
    max_budget: ''
  });

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await axios.get(`/api/events?${params}`);
      setEvents(response.data.events);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      event_type: '',
      location: '',
      min_budget: '',
      max_budget: ''
    });
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

  return (
    <div className="container mt-4">
      {/* Hero Section */}
      <div className="row mb-5">
        <div className="col-12 text-center">
          <h1 className="display-4 mb-3">Find Your Perfect Event</h1>
          <p className="lead">Discover amazing event organizers for weddings, birthdays, and baby showers</p>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Filter Events</h5>
              <div className="row">
                <div className="col-md-3 mb-3">
                  <select 
                    name="event_type" 
                    value={filters.event_type} 
                    onChange={handleFilterChange}
                    className="form-select"
                  >
                    <option value="">All Types</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Birthday Party">Birthday Party</option>
                    <option value="Baby Shower">Baby Shower</option>
                  </select>
                </div>
                <div className="col-md-3 mb-3">
                  <input 
                    type="text" 
                    name="location" 
                    value={filters.location}
                    onChange={handleFilterChange}
                    placeholder="Location" 
                    className="form-control"
                  />
                </div>
                <div className="col-md-2 mb-3">
                  <input 
                    type="number" 
                    name="min_budget" 
                    value={filters.min_budget}
                    onChange={handleFilterChange}
                    placeholder="Min Budget" 
                    className="form-control"
                  />
                </div>
                <div className="col-md-2 mb-3">
                  <input 
                    type="number" 
                    name="max_budget" 
                    value={filters.max_budget}
                    onChange={handleFilterChange}
                    placeholder="Max Budget" 
                    className="form-control"
                  />
                </div>
                <div className="col-md-2 mb-3">
                  <button onClick={clearFilters} className="btn btn-outline-secondary w-100">
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="row">
        {events.length > 0 ? (
          events.map(event => (
            <EventCard key={event.event_id} event={event} />
          ))
        ) : (
          <div className="col-12 text-center">
            <p className="lead">No events found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
