import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';

function toPKT(datetime) {
  try {
    const date = new Date(datetime);
    return date.toLocaleString('en-GB', { timeZone: 'Asia/Karachi' });
  } catch {
    return datetime;
  }
}

export default function Home() {
  const loggedUser = JSON.parse(localStorage.getItem('loggedUser') || 'null');
  const [view, setView] = useState(loggedUser?.user_type === 'doctor' ? 'admin' : 'client');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [showSymptomsModal, setShowSymptomsModal] = useState(false);

  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    if (!dataFetchedRef.current && loggedUser) {
      dataFetchedRef.current = true;
      
      if (view === 'client') {
        api.get('/doctors/')
          .then(response => setDoctors(response.data))
          .catch(err => console.error('Error fetching doctors:', err));
        
        api.get('/appointments/patient/')
          .then(response => setPatientAppointments(response.data))
          .catch(err => console.error('Error fetching patient appointments:', err));
      } else if (view === 'admin') {
        api.get('/appointments/doctor/')
          .then(response => setAppointments(response.data))
          .catch(err => console.error('Error fetching appointments:', err));
      }
    }
  }, []);

  function getAvailableSlots(doctorId, date) {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor || !doctor.appointment_slots) return [];
    
    return doctor.appointment_slots.filter(slot => 
      slot.date === date && slot.is_available
    );
  }

  function handleSelectDoctor(doctorId, date) {
    setSelectedDoctor(selectedDoctor === doctorId ? null : doctorId);
  }

  function openSymptomsModal(slotId) {
    if (!loggedUser) {
      alert('Please log in to book an appointment.');
      return;
    }
    
    if (loggedUser.user_type !== 'patient') {
      alert('Only patients can book appointments.');
      return;
    }
    
    setSelectedSlotId(slotId);
    setSymptoms('');
    setShowSymptomsModal(true);
  }

  function bookSlot() {
    if (!symptoms.trim()) {
      alert('Please enter your symptoms.');
      return;
    }
    
    api.post('/appointments/book/', {
      appointment_slot_id: selectedSlotId,
      symptoms: symptoms
    })
    .then(response => {
      alert('Appointment booked successfully!');
      setSelectedDate('');
      setSelectedDoctor(null);
      setShowSymptomsModal(false);
      setSymptoms('');
      setSelectedSlotId(null);
      
      api.get('/appointments/patient/')
        .then(res => setPatientAppointments(res.data))
        .catch(err => console.error('Error refreshing appointments:', err));
    })
    .catch(err => {
      console.error('Error booking:', err);
      alert('Failed to book appointment: ' + (err.response?.data?.error || err.response?.data?.detail || 'Unknown error'));
    });
  }

  return (
    <div className="app-container">
      {/* Hero Header - Only for patients */}
      {loggedUser?.user_type !== 'doctor' && (
        <div className="glass-card p-4 mb-4 fade-in">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1" style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '700' }}>
                Welcome, {loggedUser?.first_name || 'Guest'} 👋
              </h2>
              <p className="text-muted mb-0">Book your appointment with top doctors</p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className={`btn ${view === 'client' ? 'btn-gradient-primary' : 'btn-outline-primary'} btn-sm`} 
                onClick={() => setView('client')}
                style={{ borderRadius: '12px', padding: '8px 20px', fontWeight: '600' }}
              >
                📅 Book Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'client' && (
        <section className="fade-in">
          {/* Booking Card */}
          <div className="modern-card p-4 mb-4">
            <h4 className="mb-4" style={{ fontWeight: '700', color: 'var(--dark)' }}>
              <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                🗓️ Select Appointment Date
              </span>
            </h4>
            <input 
              className="form-control form-control-lg" 
              type="date" 
              value={selectedDate} 
              onChange={e => setSelectedDate(e.target.value)}
              style={{ borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '16px' }}
            />
          </div>

          {selectedDate && (
            <div className="slide-in">
              <h4 className="mb-3" style={{ fontWeight: '700', color: 'white' }}>
                Available Doctors on {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h4>
              <div className="row g-3">
                {doctors.map(d => {
                  const availableSlots = getAvailableSlots(d.id, selectedDate);
                  return availableSlots.length > 0 ? (
                    <div key={d.id} className="col-lg-6">
                      <div className="modern-card p-4">
                        <div className="d-flex align-items-start justify-content-between mb-3">
                          <div className="d-flex gap-3">
                            <div className="d-flex align-items-center justify-content-center" 
                                 style={{ width: '60px', height: '60px', background: 'var(--gradient-primary)', borderRadius: '16px', fontSize: '24px' }}>
                              👨‍⚕️
                            </div>
                            <div>
                              <h5 className="mb-1" style={{ fontWeight: '700' }}>
                                Dr. {d.user.first_name} {d.user.last_name}
                              </h5>
                              <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                                🩺 {d.specialization}
                              </p>
                              <span className="modern-badge bg-success text-white mt-2 d-inline-block">
                                {availableSlots.length} slots available
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <button 
                          className={`btn ${selectedDoctor === d.id ? 'btn-gradient-secondary' : 'btn-gradient-primary'} w-100`}
                          onClick={() => handleSelectDoctor(d.id, selectedDate)}
                          style={{ borderRadius: '12px', fontWeight: '600' }}
                        >
                          {selectedDoctor === d.id ? '▲ Hide Time Slots' : '▼ View Time Slots'}
                        </button>
                        
                        {selectedDoctor === d.id && (
                          <div className="mt-3 slide-in">
                            <hr className="my-3" />
                            <h6 className="mb-3" style={{ fontWeight: '600', color: 'var(--gray)' }}>⏰ Available Time Slots:</h6>
                            <div className="d-flex flex-wrap gap-2">
                              {getAvailableSlots(d.id, selectedDate).map((slot) => (
                                <button 
                                  key={slot.id} 
                                  className="btn btn-outline-success" 
                                  onClick={() => openSymptomsModal(slot.id)}
                                  style={{ 
                                    borderRadius: '10px', 
                                    fontWeight: '600', 
                                    padding: '10px 20px',
                                    border: '2px solid #10b981',
                                    transition: 'all 0.3s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.background = '#10b981';
                                    e.target.style.color = 'white';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.background = 'transparent';
                                    e.target.style.color = '#10b981';
                                  }}
                                >
                                  🕒 {slot.start_time.slice(0,5)} - {slot.end_time.slice(0,5)}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null;
                })}
                {doctors.filter(d => getAvailableSlots(d.id, selectedDate).length > 0).length === 0 && (
                  <div className="col-12">
                    <div className="modern-card p-5 text-center">
                      <div style={{ fontSize: '64px', marginBottom: '16px' }}>📅</div>
                      <h5 style={{ fontWeight: '600', color: 'var(--gray)' }}>No doctors available on this date</h5>
                      <p className="text-muted">Please select a different date</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Patient Appointments */}
          <div className="mt-5">
            <h4 className="mb-4" style={{ fontWeight: '700', color: 'white' }}>
              📋 My Appointments
            </h4>
            <div className="row g-3">
              {patientAppointments.length === 0 && (
                <div className="col-12">
                  <div className="modern-card p-5 text-center">
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>📝</div>
                    <h5 style={{ fontWeight: '600', color: 'var(--gray)' }}>No appointments yet</h5>
                    <p className="text-muted">Book your first appointment above</p>
                  </div>
                </div>
              )}
              {patientAppointments.map(appointment => (
                <div key={appointment.id} className="col-lg-6">
                  <div className="modern-card p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex gap-3">
                        <div className="d-flex align-items-center justify-content-center" 
                             style={{ width: '50px', height: '50px', background: 'var(--gradient-success)', borderRadius: '12px', fontSize: '24px' }}>
                          👨‍⚕️
                        </div>
                        <div>
                          <h6 className="mb-1" style={{ fontWeight: '700' }}>
                            Dr. {appointment.appointment_slot?.doctor?.user?.first_name} {appointment.appointment_slot?.doctor?.user?.last_name}
                          </h6>
                          {appointment.appointment_slot?.doctor?.specialization && (
                            <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                              {appointment.appointment_slot.doctor.specialization}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`modern-badge bg-${appointment.status === 'accepted' ? 'success' : appointment.status === 'rejected' ? 'danger' : 'warning'}`}>
                        {appointment.status === 'accepted' ? '✓ ' : appointment.status === 'rejected' ? '✗ ' : '⏳ '}
                        {appointment.status}
                      </span>
                    </div>
                    <div className="p-3" style={{ background: '#f8fafc', borderRadius: '12px' }}>
                      <div className="mb-2">
                        <strong style={{ fontSize: '13px', color: 'var(--gray)' }}>📅 Date & Time:</strong>
                        <p className="mb-0" style={{ fontSize: '14px', fontWeight: '600' }}>
                          {appointment.appointment_slot?.date} • {appointment.appointment_slot?.start_time?.slice(0,5)} - {appointment.appointment_slot?.end_time?.slice(0,5)}
                        </p>
                      </div>
                      <div>
                        <strong style={{ fontSize: '13px', color: 'var(--gray)' }}>🩺 Symptoms:</strong>
                        <p className="mb-0" style={{ fontSize: '14px' }}>{appointment.symptoms}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Symptoms Modal */}
      {showSymptomsModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modern-card modal-content border-0">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title" style={{ fontWeight: '700', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  🩺 Describe Your Symptoms
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowSymptomsModal(false)}></button>
              </div>
              <div className="modal-body pt-2">
                <label className="form-label" style={{ fontWeight: '600', color: 'var(--gray)', fontSize: '14px' }}>
                  Please provide details about your symptoms:
                </label>
                <textarea
                  className="form-control"
                  rows="5"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="E.g., Persistent headache for 3 days, fever, body ache..."
                  required
                  style={{ borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '15px' }}
                />
              </div>
              <div className="modal-footer border-0">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowSymptomsModal(false)} style={{ borderRadius: '12px', fontWeight: '600' }}>
                  Cancel
                </button>
                <button type="button" className="btn btn-gradient-primary" onClick={bookSlot}>
                  ✓ Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'admin' && (
        <section className="fade-in">
          <div className="glass-card p-4 mb-4">
            <h3 style={{ fontWeight: '700', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              👨‍⚕️ Dr. {loggedUser.first_name}'s Appointments
            </h3>
            <p className="text-muted mb-0">Manage your patient appointments</p>
          </div>

          <div className="row g-3">
            {appointments.length === 0 && (
              <div className="col-12">
                <div className="modern-card p-5 text-center">
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
                  <h5 style={{ fontWeight: '600', color: 'var(--gray)' }}>No appointment requests yet</h5>
                  <p className="text-muted">New appointments will appear here</p>
                </div>
              </div>
            )}
            {appointments.map(r => (
              <div key={r.id} className="col-lg-6">
                <div className="modern-card p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex gap-3">
                      <div className="d-flex align-items-center justify-content-center" 
                           style={{ width: '50px', height: '50px', background: 'var(--gradient-secondary)', borderRadius: '12px', fontSize: '24px' }}>
                        🧑‍⚕️
                      </div>
                      <div>
                        <h6 className="mb-1" style={{ fontWeight: '700' }}>
                          {r.patient.user.first_name} {r.patient.user.last_name}
                        </h6>
                        <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                          📧 {r.patient.user.email}
                        </p>
                      </div>
                    </div>
                    <span className={`modern-badge bg-${r.status === 'accepted' ? 'success' : r.status === 'rejected' ? 'danger' : 'secondary'}`}>
                      {r.status === 'accepted' ? '✓ ' : r.status === 'rejected' ? '✗ ' : '⏳ '}
                      {r.status}
                    </span>
                  </div>
                  <div className="p-3 mb-2" style={{ background: '#f8fafc', borderRadius: '12px' }}>
                    <div className="mb-2">
                      <strong style={{ fontSize: '13px', color: 'var(--gray)' }}>📅 Scheduled:</strong>
                      <p className="mb-0" style={{ fontSize: '14px', fontWeight: '600' }}>
                        {r.appointment_slot?.date} • {r.appointment_slot?.start_time?.slice(0,5)} - {r.appointment_slot?.end_time?.slice(0,5)}
                      </p>
                    </div>
                    <div>
                      <strong style={{ fontSize: '13px', color: 'var(--gray)' }}>🩺 Symptoms:</strong>
                      <p className="mb-0" style={{ fontSize: '14px' }}>{r.symptoms}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}