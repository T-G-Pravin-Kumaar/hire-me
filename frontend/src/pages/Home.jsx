import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, ShieldCheck, Clock, MapPin, Sparkles } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
      <section className="hero">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'var(--primary-light)', borderRadius: '9999px', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '24px' }}>
          <Sparkles size={14} /> One-Way Travel Made Effortless
        </div>
        <h1>Hire Verified Drivers for Your Personal Vehicles</h1>
        <p>
          Tired of long, exhausting drives? Hire Me connects you with professional, thoroughly verified drivers for one-way journeys. Let them handle the wheel of your own car or book a driver with a vehicle.
        </p>
        <div className="flex justify-center gap-4">
          {user ? (
            <Link to={`/${user.role}/dashboard`} className="btn btn-primary">
              Go to my Dashboard
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary">
                Book a Driver Now
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Partner with us as a Driver
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="container" style={{ marginTop: '40px' }}>
        <div className="grid grid-3">
          <div className="card card-premium">
            <div className="metric-icon" style={{ marginBottom: '16px' }}>
              <ShieldCheck size={28} />
            </div>
            <h3 style={{ marginBottom: '12px' }}>Verified Professionals</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Every driver is vetted for safety. We verify government licenses, age restrictions, and driving background reports so you travel with complete peace of mind.
            </p>
          </div>

          <div className="card card-premium">
            <div className="metric-icon" style={{ marginBottom: '16px', color: 'var(--success)', backgroundColor: 'var(--success-light)' }}>
              <MapPin size={28} />
            </div>
            <h3 style={{ marginBottom: '12px' }}>Smart Routing & Fares</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Our automated coordinate distance calculations determine trip fares transparently. We calculate trip segments and return compensations before you book.
            </p>
          </div>

          <div className="card card-premium">
            <div className="metric-icon" style={{ marginBottom: '16px', color: 'var(--warning)', backgroundColor: 'var(--warning-light)' }}>
              <Clock size={28} />
            </div>
            <h3 style={{ marginBottom: '12px' }}>Driver Rest Guidelines</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              We prioritize safety. After completing a trip, drivers go into a mandatory resting window of 8 hours. This prevents fatigue and ensures alertness on the road.
            </p>
          </div>
        </div>
      </section>

      <section className="container text-center" style={{ marginTop: '100px' }}>
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px' }}>
          <h2 style={{ marginBottom: '16px' }}>Ready to get started?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
            Register in under two minutes. Whether you are a car owner needing a driver or a professional driver seeking trip opportunities, Hire Me is built for you.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="btn btn-primary">Create an Account</Link>
            <Link to="/login" className="btn btn-secondary">Sign In</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
