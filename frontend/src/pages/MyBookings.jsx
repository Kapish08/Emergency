import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle, XCircle, Clock, Navigation } from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const { t } = useLanguage();

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings');
      setBookings(data.bookings);
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to fetch bookings.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const cancelBooking = async (id) => {
    try {
      await api.patch(`/bookings/${id}/cancel`);
      addToast({ type: 'success', title: 'Cancelled', message: 'Booking has been cancelled.' });
      fetchBookings();
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Could not cancel booking.' });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="text-green" size={20} />;
      case 'cancelled': return <XCircle className="text-red" size={20} />;
      case 'pending': return <Clock className="text-yellow" size={20} />;
      default: return null;
    }
  };

  return (
    <div className="dashboard-page animate-fade-in text-light mt-4">
      <h1 style={{ marginBottom: '1rem' }}>My Bookings</h1>
      <p style={{ color: 'var(--clr-text-dim)', marginBottom: '2rem' }}>Manage your emergency bed reservations.</p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ margin: 'auto' }} />
        </div>
      ) : bookings.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>You have no active or past bookings.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bookings.map((booking) => (
            <div key={booking._id} className="glass-card flex-row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                    padding: '1rem', 
                    background: 'rgba(255,100,100,0.1)', 
                    borderRadius: '1rem',
                  }}>
                  🛏️
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{booking.hospital?.name || 'Local Hospital'}</h3>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.4rem', color: 'var(--clr-text-dim)' }}>
                    <span>Type: <strong style={{color: 'white', textTransform: 'uppercase'}}>{booking.bedType}</strong></span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', textTransform: 'capitalize' }}>
                      {getStatusIcon(booking.status)} {booking.status}
                    </span>
                    <span>•</span>
                    <span>{new Date(booking.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {booking.hospital && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${booking.hospital.lat},${booking.hospital.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Navigation size={16} /> Navigate
                  </a>
                )}
                {booking.status === 'confirmed' && (
                  <button 
                    onClick={() => cancelBooking(booking._id)}
                    className="btn btn-ghost" 
                    style={{ color: 'var(--clr-red)' }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
